"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Full name required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "At least 6 chars"),
  phone: z.string().min(10, "Valid phone required"),
  role: z.enum(["family", "ngo", "police"])
});
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "family" }
  });

  const onRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const targetRole = data.role === "police" ? "admin" : data.role; 

      await setDoc(doc(db, "users", userCredential.user.uid), {
        id: userCredential.user.uid,
        email: data.email,
        name: data.name,
        role: targetRole,
        phone: data.phone,
        createdAt: new Date().toISOString()
      });

      toast.success("Account created securely.");
      router.push("/dashboard/cases");
    } catch (e: any) {
      toast.error(e.message || "Failed to register account.");
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSubmit = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const selectedRole = getValues("role");
      const targetRole = selectedRole === "police" ? "admin" : selectedRole;

      await setDoc(doc(db, "users", result.user.uid), {
        id: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || "Google User",
        role: targetRole,
        phone: result.user.phoneNumber || "",
        createdAt: new Date().toISOString()
      }, { merge: true });

      toast.success("Joined network securely via Google.");
      router.push("/dashboard/cases");
    } catch (e: any) {
      toast.error(e.message || "Failed to authenticate with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      {/* Left Branding Pane - Hidden on Mobile */}
      <div className="hidden lg:flex w-1/2 bg-[var(--bg-surface)] border-r border-[var(--border)] flex-col justify-between p-12 relative overflow-hidden">
         <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[var(--brand)]/10 rounded-full blur-[120px] pointer-events-none"></div>
         <div className="flex items-center gap-2 relative z-10">
           <div className="bg-[var(--brand)] p-1.5 rounded flex items-center justify-center"><Shield className="text-white w-5 h-5"/></div>
           <span className="font-bold text-[18px] text-[var(--text-primary)] tracking-[-0.02em]">FindSystem</span>
         </div>
         <div className="space-y-6 relative z-10 max-w-lg mb-12">
            <h2 className="text-[32px] font-bold text-[var(--text-primary)] tracking-[-0.03em] leading-tight">
               "Centralized datasets are critical for accelerating investigation cycles. FindSystem bridges the gap."
            </h2>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)]" />
               <div>
                  <p className="text-[14px] font-bold text-[var(--text-primary)]">Chief R. Davies</p>
                  <p className="text-[13px] text-[var(--text-secondary)]">Metropolitan Task Force</p>
               </div>
            </div>
         </div>
      </div>

      {/* Right Register Pane */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[var(--bg-base)] py-12">
        <div className="w-full max-w-[460px] bg-[var(--bg-surface)] rounded-[14px] shadow-modal border border-[var(--border)] p-8 md:p-10 animate-fade-in-up">
           
           {/* Mobile Logo Fallback */}
           <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
             <div className="bg-[var(--brand)] p-1.5 rounded"><Shield className="text-white w-4 h-4"/></div>
             <span className="font-bold text-[18px] text-[var(--text-primary)] tracking-[-0.02em]">FindSystem</span>
           </div>

           <div className="text-center mb-8">
             <h1 className="text-[24px] font-bold text-[var(--text-primary)] tracking-[-0.03em]">Create Account</h1>
             <p className="text-[14px] text-[var(--text-secondary)] mt-1">Join the intelligence network</p>
           </div>
           
           <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[var(--text-primary)]">Full Name</label>
                <Input placeholder="John Doe" {...register("name")} />
                {errors.name && <p className="text-[12px] text-[var(--danger)]">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[var(--text-primary)]">Email Address</label>
                <Input type="email" placeholder="name@example.com" {...register("email")} />
                {errors.email && <p className="text-[12px] text-[var(--danger)]">{errors.email.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-[13px] font-medium text-[var(--text-primary)]">Password</label>
                   <Input type="password" placeholder="••••••••" {...register("password")} />
                   {errors.password && <p className="text-[12px] text-[var(--danger)]">{errors.password.message}</p>}
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[13px] font-medium text-[var(--text-primary)]">Phone Number</label>
                   <Input placeholder="555-0192" {...register("phone")} />
                   {errors.phone && <p className="text-[12px] text-[var(--danger)]">{errors.phone.message}</p>}
                 </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[var(--text-primary)]">Clearance Level</label>
                <select 
                  {...register("role")}
                  className="flex h-10 w-full rounded-[6px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:shadow-[0_0_0_3px_var(--brand-glow)] transition-all duration-150"
                >
                  <option value="family">Reporting Citizen / Family</option>
                  <option value="ngo">NGO Associate</option>
                  <option value="police">Law Enforcement Officer</option>
                </select>
              </div>

              <Button type="submit" className="w-full mt-2 h-11" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Creating Profile..." : "Create Account"}
              </Button>
           </form>

           <div className="mt-6 flex items-center justify-between">
              <span className="w-1/5 border-b border-[var(--border)] lg:w-1/4"></span>
              <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Or register with</span>
              <span className="w-1/5 border-b border-[var(--border)] lg:w-1/4"></span>
           </div>

           <Button variant="secondary" onClick={onGoogleSubmit} disabled={isLoading} className="w-full mt-6 h-11 flex items-center justify-center gap-3 border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] hover:text-white transition-all text-[var(--text-primary)]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
           </Button>

           <p className="text-[13px] text-center text-[var(--text-secondary)] mt-8">
             Already active? <Link href="/login" className="font-semibold text-[var(--text-primary)] hover:text-[var(--brand)] transition-colors">Sign in</Link>
           </p>
        </div>
      </div>
    </div>
  );
}
