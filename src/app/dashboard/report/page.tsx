"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UploadCloud, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/useAppStore";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const reportSchema = z.object({
  name: z.string().min(2, "Full name required"),
  age: z.number().min(1, "Valid age").max(150, "Too long"),
  gender: z.enum(["Male", "Female", "Other", "Unknown"]),
  lastSeenLocation: z.string().min(5, "Be specific"),
  lastSeenDate: z.string().min(1, "Required"),
  description: z.string().min(20, "Provide description"),
  contactNumber: z.string().min(10, "Valid number"),
});
type ReportForm = z.infer<typeof reportSchema>;

export default function ReportCasePage() {
  const router = useRouter();
  const { user } = useAppStore();
  
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    mode: "onChange"
  });

  const nextStep = async () => {
    if (step === 1) {
      const valid = await trigger(["name", "age", "gender", "lastSeenLocation", "lastSeenDate"]);
      if (valid) setStep(2);
    } else if (step === 2) {
      if (!file) {
         toast.error("Reference photo strictly required for AI extraction.");
         return;
      }
      const valid = await trigger(["description", "contactNumber"]);
      if (valid) setStep(3);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selected);
  };

  const onSubmit = async () => {
    if (!file || !user) return;
    setIsSubmitting(true);
    try {
      const data = getValues();
      const caseId = `case_${Date.now()}`;
      let photoURL = preview as string; 
      
      const caseData = {
        id: caseId,
        ...data,
        photoURL,
        status: "Active",
        reportedBy: user.id,
        reportedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "missingPersons", caseId), caseData);
      toast.success("Profile actively injected into global tracking.");
      router.push(`/dashboard/cases/${caseId}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      
      <div className="flex items-center justify-between pb-8">
         <div className="flex flex-col items-start gap-2">
            <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">Register New Report</h1>
            <p className="text-[14px] text-[var(--text-secondary)]">Artificial Intelligence parameter injection.</p>
         </div>
      </div>
      
      <div className="flex items-center gap-3 mb-10 w-full px-4 sm:px-0">
         {[1, 2, 3].map((idx) => (
           <div key={idx} className="flex-1 flex items-center gap-3">
             <div className={`
               w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 shrink-0
               ${step > idx ? 'bg-[var(--success)] text-white shadow-sm' : step === idx ? 'bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand-glow)] ring-4 ring-[var(--brand-glow)]' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}
             `}>
               {step > idx ? <CheckCircle2 className="w-4 h-4"/> : idx}
             </div>
             {idx < 3 && (
                <div className={`h-[2px] flex-1 rounded-full transition-all duration-500 ${step > idx ? 'bg-[var(--success)]' : 'bg-[var(--bg-subtle)]'}`} />
             )}
           </div>
         ))}
      </div>

      <div className="relative overflow-hidden bg-[var(--bg-surface)] rounded-[14px] border border-[var(--border)] shadow-modal min-h-[400px]">
        {/* Step 1 */}
        {step === 1 && (
          <div className="animate-fade-in-up flex flex-col h-full">
            <div className="p-8 pb-2 space-y-6 flex-1">
               <h2 className="text-[20px] font-bold text-[var(--text-primary)]">Personal Parameters</h2>
               <div className="grid sm:grid-cols-2 gap-5">
                 <div className="space-y-1.5 sm:col-span-2">
                   <label className="text-[13px] font-semibold text-[var(--text-primary)]">Full Name</label>
                   <Input {...register("name")} placeholder="Jane Doe" />
                   {errors.name && <p className="text-[12px] text-[var(--danger)]">{errors.name.message}</p>}
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[13px] font-semibold text-[var(--text-primary)]">Age</label>
                   <Input type="number" {...register("age", { valueAsNumber: true })} placeholder="34" />
                   {errors.age && <p className="text-[12px] text-[var(--danger)]">{errors.age.message}</p>}
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[13px] font-semibold text-[var(--text-primary)]">Gender</label>
                   <select {...register("gender")} className="flex h-[40px] w-full rounded-[6px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:shadow-[0_0_0_3px_var(--brand-glow)]">
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                     <option value="Other">Other</option>
                     <option value="Unknown">Unknown</option>
                   </select>
                 </div>
                 <div className="space-y-1.5 sm:col-span-2">
                   <label className="text-[13px] font-semibold text-[var(--text-primary)]">Last Known Coordinates (Location)</label>
                   <Input {...register("lastSeenLocation")} placeholder="City, landmarks..." />
                 </div>
                 <div className="space-y-1.5 sm:col-span-2">
                   <label className="text-[13px] font-semibold text-[var(--text-primary)]">Temporal Stamp (Date & Time)</label>
                   <Input type="datetime-local" {...register("lastSeenDate")} />
                 </div>
               </div>
            </div>
            <div className="p-6 bg-[var(--bg-elevated)] border-t border-[var(--border)] flex justify-end">
               <Button onClick={nextStep} size="lg">Continue <ArrowRight className="w-4 h-4 ml-2"/></Button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="animate-fade-in-up flex flex-col h-full">
            <div className="p-8 pb-2 space-y-6 flex-1">
                <h2 className="text-[20px] font-bold text-[var(--text-primary)]">Neural Upload</h2>
                
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--text-primary)]">Facial Extractor Source File</label>
                  {!preview ? (
                    <div 
                       onClick={() => fileInputRef.current?.click()} 
                       className="group border-2 border-dashed border-[var(--bg-subtle)] hover:border-[var(--brand)] rounded-[12px] h-[220px] flex flex-col items-center justify-center cursor-pointer transition-all bg-[var(--bg-elevated)] hover:bg-[var(--brand-glow)]"
                    >
                       <div className="w-[64px] h-[64px] rounded-full bg-[var(--bg-surface)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                          <UploadCloud className="w-8 h-8 text-[var(--text-muted)] group-hover:text-[var(--brand)]" />
                       </div>
                       <span className="text-[14px] font-bold text-[var(--text-primary)]">Browse files or drop image here</span>
                       <span className="text-[12px] text-[var(--text-muted)] mt-1">High-clarity portraits yield 99.8% bounds.</span>
                    </div>
                  ) : (
                    <div className="relative h-[220px] rounded-[12px] overflow-hidden group border border-[var(--border)]">
                       <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <Button variant="danger" onClick={() => { setFile(null); setPreview(null); }}>Remove & Replace</Button>
                       </div>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFile} />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                   <div className="space-y-1.5 sm:col-span-2">
                     <label className="text-[13px] font-semibold text-[var(--text-primary)]">Physical Modifiers (Clothing, Scars)</label>
                     <textarea {...register("description")} className="flex w-full rounded-[6px] border border-[var(--border)] bg-[var(--bg-elevated)] px-[12px] py-[8px] text-[14px] text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:shadow-[0_0_0_3px_var(--brand-glow)] transition-all min-h-[80px]" placeholder="Specific identifiers..."></textarea>
                     {errors.description && <p className="text-[12px] text-[var(--danger)]">{errors.description.message}</p>}
                   </div>
                   <div className="space-y-1.5 sm:col-span-2">
                     <label className="text-[13px] font-semibold text-[var(--text-primary)]">Priority Contact Callback</label>
                     <Input type="tel" {...register("contactNumber")} placeholder="+1" />
                     {errors.contactNumber && <p className="text-[12px] text-[var(--danger)]">{errors.contactNumber.message}</p>}
                   </div>
                </div>
            </div>
            <div className="p-6 bg-[var(--bg-elevated)] border-t border-[var(--border)] flex justify-between">
               <Button variant="secondary" onClick={() => setStep(1)} size="lg"><ArrowLeft className="w-4 h-4 mr-2"/> Back</Button>
               <Button onClick={nextStep} size="lg">Review <ArrowRight className="w-4 h-4 ml-2"/></Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="animate-fade-in-up flex flex-col h-full">
            <div className="p-8 pb-2 flex-1">
               <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-6">Execution Review</h2>
               <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[10px] p-6">
                  
                  <div className="flex items-center gap-5 border-b border-[var(--bg-subtle)] pb-6 mb-6">
                     <img src={preview!} alt="Preview" className="w-[80px] h-[80px] rounded-full object-cover shadow-sm border border-[var(--border-strong)]" />
                     <div>
                       <h3 className="text-[24px] font-bold leading-tight text-[var(--text-primary)]">{getValues("name")}</h3>
                       <p className="text-[14px] text-[var(--text-secondary)] font-medium">{getValues("age")} yrs • {getValues("gender")}</p>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-6">
                    <div>
                      <p className="text-caption">Location Logged</p>
                      <p className="text-[14px] font-semibold mt-1 text-[var(--text-primary)]">{getValues("lastSeenLocation")}</p>
                    </div>
                    <div>
                      <p className="text-caption">Date Logged</p>
                      <p className="text-[14px] font-semibold mt-1 text-[var(--text-primary)]">{new Date(getValues("lastSeenDate")).toLocaleDateString()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-caption">Modifiers</p>
                      <p className="text-[14px] mt-1 text-[var(--text-secondary)] leading-relaxed">{getValues("description")}</p>
                    </div>
                  </div>

               </div>
               <div className="mt-6 flex gap-3 text-[var(--success)] bg-[var(--success-bg)] p-4 rounded-[8px] items-start border border-[rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-[13px] font-medium leading-relaxed">
                    By submitting, the AI engine will immediately parse this image and spawn a 128-dimensional mathematical vector distributed across all active CCTV nodes.
                  </p>
               </div>
            </div>
            <div className="p-6 bg-[var(--bg-elevated)] border-t border-[var(--border)] flex justify-between">
               <Button variant="secondary" onClick={() => setStep(2)} size="lg"><ArrowLeft className="w-4 h-4 mr-2"/> Back</Button>
               <Button onClick={onSubmit} disabled={isSubmitting} size="lg">
                 {isSubmitting ? "Generating Vectors..." : "Execute Global Protocol"}
               </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
