"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, UploadCloud } from "lucide-react";
import { toast } from "sonner";

export function PublicTipForm() {
  const submitTip = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you! Your information has been securely submitted to the authorities.");
  };

  return (
    <Card className="border-sky-200 dark:border-sky-900/50 shadow-md relative overflow-hidden">
       <div className="absolute top-0 left-0 w-2 h-full bg-sky-500" />
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <Camera className="text-sky-600 w-5 h-5" /> 
           Have You Seen This Person?
         </CardTitle>
       </CardHeader>
       <CardContent>
         <form onSubmit={submitTip} className="space-y-4">
           <div className="grid sm:grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-sm font-medium">Location Seen</label>
               <Input required placeholder="E.g., Central Park entrance" />
             </div>
             <div className="space-y-1.5">
               <label className="text-sm font-medium">Date & Time</label>
               <Input required type="datetime-local" />
             </div>
           </div>
           
           <div className="space-y-1.5 pt-2">
             <label className="text-sm font-medium">Upload Photo (Optional, highly helpful for AI match)</label>
             <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-md p-4 flex justify-center items-center gap-2 bg-slate-50 dark:bg-slate-900 text-slate-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <UploadCloud className="w-5 h-5" />
                <span className="text-sm">Tap to attach photo</span>
             </div>
           </div>

           <div className="space-y-1.5 pt-2">
             <label className="text-sm font-medium">Additional Details</label>
             <textarea 
               required
               className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-slate-300 min-h-[100px]" 
               placeholder="What were they wearing? Were they with anyone?" 
             />
           </div>

           <div className="pt-2">
              <Button type="submit" size="lg" className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700">Submit Information Securely</Button>
              <p className="text-xs text-slate-500 mt-2 text-center sm:text-left">Your tip will be analyzed by our AI system and routed directly to investigating authorities.</p>
           </div>
         </form>
       </CardContent>
    </Card>
  );
}
