"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onEmailLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success("Successfully logged in");
      router.push("/dashboard/cases");
    } catch (e: any) {
      toast.error(e.message || "Failed to login. Check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          id: user.uid,
          email: user.email,
          name: user.displayName || "Google User",
          role: "family",
          createdAt: new Date().toISOString()
        });
      }
      toast.success("Logged in with Google");
      router.push("/dashboard/cases");
    } catch (e: any) {
      toast.error(e.message || "Failed Google sign in");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      {/* Left Branding Pane - Hidden on Mobile */}
      <div className="hidden lg:flex w-[45%] bg-[var(--bg-surface)] border-r border-[var(--border)] flex-col justify-between p-12 relative overflow-hidden">
         {/* Animated Grid Background */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
         
         {/* Floating Glows */}
         <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[var(--brand)]/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

         <div className="flex items-center gap-2 relative z-10">
           <div className="bg-[var(--brand)] p-1.5 rounded-lg shadow-[0_0_15px_var(--brand-glow)] flex items-center justify-center"><Shield className="text-white w-5 h-5"/></div>
           <span className="font-extrabold text-[20px] text-[var(--text-primary)] tracking-tight">Findra AI</span>
         </div>

         <div className="relative z-10 flex flex-col gap-8 mb-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[11px] font-bold text-[var(--brand)] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-ping"></span>
                Network Active
              </div>
              <h2 className="text-[42px] font-bold text-white tracking-tight leading-[1.1] max-w-[480px]">
                Global <span className="text-[var(--brand)]">Intelligence</span> for missing persons.
              </h2>
            </div>

            <div className="p-6 rounded-[20px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-2xl relative group">
               <div className="absolute -top-6 -right-6 w-32 h-32 bg-[var(--brand)]/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <p className="text-[18px] font-medium text-gray-300 leading-relaxed italic relative z-10">
                  "The speed of the facial matching network is exactly what reunited us with our daughter within 48 hours."
               </p>
               <div className="flex items-center gap-4 mt-6 relative z-10">
                  <div className="w-12 h-12 rounded-full border-2 border-[var(--brand)] p-0.5 bg-[var(--bg-elevated)] overflow-hidden">
                     <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[12px] font-bold">SJ</div>
                  </div>
                  <div>
                     <p className="text-[14px] font-bold text-white tracking-wide">Sarah Jenkins</p>
                     <p className="text-[12px] text-[var(--text-muted)]">Reunited Family Member</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="relative z-10 text-[12px] text-[var(--text-muted)] font-medium">
            © 2024 Findra Intelligence. Secure Vector Protocol v2.4.0
         </div>
      </div>

      {/* Right Login Pane */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-4 sm:p-8 md:p-12 bg-[var(--bg-base)]">
        <div className="w-full max-w-[440px] space-y-8 animate-fade-in-up">
           <div className="bg-[var(--bg-surface)] rounded-[24px] shadow-2xl border border-[var(--border)] p-8 md:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand)]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--brand)]/10 transition-all duration-700"></div>
              
              {/* Mobile Logo Fallback */}
              <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
                <div className="bg-[var(--brand)] p-1.5 rounded-lg shadow-[0_0_15px_var(--brand-glow)]"><Shield className="text-white w-5 h-5"/></div>
                <span className="font-bold text-[20px] text-[var(--text-primary)] tracking-tight">Findra AI</span>
              </div>

              <div className="text-center mb-10">
                <h1 className="text-[32px] font-bold text-white tracking-tight">Welcome Back</h1>
                <p className="text-[15px] text-[var(--text-secondary)] mt-2">Access your surveillance terminal</p>
              </div>
              
              <form onSubmit={handleSubmit(onEmailLogin)} className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[13px] font-bold text-gray-300 tracking-wide uppercase">Email Terminal</label>
                   <Input type="email" placeholder="name@example.com" className="h-12 bg-[var(--bg-elevated)] border-[var(--border)] focus:ring-2 ring-[var(--brand)]/20" {...register("email")} />
                   {errors.email && <p className="text-[12px] text-[var(--danger)] font-medium mt-1">{errors.email.message}</p>}
                 </div>

                 <div className="space-y-2">
                   <div className="flex items-center justify-between">
                     <label className="text-[13px] font-bold text-gray-300 tracking-wide uppercase">Secure Password</label>
                     <Link href="#" className="text-[12px] text-[var(--brand)] hover:underline font-semibold">Forgot Access?</Link>
                   </div>
                   <Input type="password" placeholder="••••••••" className="h-12 bg-[var(--bg-elevated)] border-[var(--border)] focus:ring-2 ring-[var(--brand)]/20" {...register("password")} />
                   {errors.password && <p className="text-[12px] text-[var(--danger)] font-medium mt-1">{errors.password.message}</p>}
                 </div>

                 <Button type="submit" className="w-full h-12 text-[15px] font-bold shadow-lg shadow-[var(--brand-glow)]" disabled={isLoading}>
                   {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                   {isLoading ? "Authenticating..." : "Establish Connection"}
                 </Button>
              </form>

              <div className="flex items-center my-8">
                 <div className="flex-1 border-t border-[var(--border)] opacity-50"></div>
                 <span className="px-4 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Protocol Sync</span>
                 <div className="flex-1 border-t border-[var(--border)] opacity-50"></div>
              </div>

              <Button 
                 variant="secondary" 
                 className="w-full h-12 bg-[var(--bg-elevated)] border-[var(--border)] hover:bg-[var(--bg-base)] text-white font-semibold transition-all flex items-center justify-center gap-3" 
                 onClick={onGoogleLogin}
                 disabled={isGoogleLoading}
               >
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                   <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                   <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                   <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                   <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                 </svg>
                 Google Sync
              </Button>
           </div>
           
           <p className="text-[14px] text-center text-[var(--text-secondary)] font-medium">
             Need a new terminal? <Link href="/register" className="text-[var(--brand)] hover:underline font-bold transition-all ml-1">Register Agency</Link>
           </p>
        </div>
      </div>
    </div>
  );
}
