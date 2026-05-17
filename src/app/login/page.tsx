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
      <div className="hidden lg:flex w-1/2 bg-[var(--bg-surface)] border-r border-[var(--border)] flex-col justify-between p-12 relative overflow-hidden">
         <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[var(--brand)]/10 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="flex items-center gap-2 relative z-10">
           <div className="bg-[var(--brand)] p-1.5 rounded flex items-center justify-center"><Shield className="text-white w-5 h-5"/></div>
           <span className="font-bold text-[18px] text-[var(--text-primary)] tracking-[-0.02em]">FindSystem</span>
         </div>
         <div className="space-y-6 relative z-10 max-w-lg mb-12">
            <h2 className="text-[32px] font-bold text-[var(--text-primary)] tracking-[-0.03em] leading-tight">
               "The speed of the facial matching network is exactly what reunited us with our daughter within 48 hours."
            </h2>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)]" />
               <div>
                  <p className="text-[14px] font-bold text-[var(--text-primary)]">Sarah Jenkins</p>
                  <p className="text-[13px] text-[var(--text-secondary)]">Reunited Family Member</p>
               </div>
            </div>
         </div>
      </div>

      {/* Right Login Pane */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[var(--bg-base)]">
        <div className="w-full max-w-[420px] bg-[var(--bg-surface)] rounded-[14px] shadow-modal border border-[var(--border)] p-8 md:p-10 animate-fade-in-up">
           
           {/* Mobile Logo Fallback */}
           <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
             <div className="bg-[var(--brand)] p-1.5 rounded"><Shield className="text-white w-4 h-4"/></div>
             <span className="font-bold text-[18px] text-[var(--text-primary)] tracking-[-0.02em]">FindSystem</span>
           </div>

           <div className="text-center mb-8">
             <h1 className="text-[24px] font-bold text-[var(--text-primary)] tracking-[-0.03em]">Welcome Back</h1>
             <p className="text-[14px] text-[var(--text-secondary)] mt-1">Sign in to your dashboard</p>
           </div>
           
           <form onSubmit={handleSubmit(onEmailLogin)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[var(--text-primary)]">Email address</label>
                <Input type="email" placeholder="name@example.com" {...register("email")} />
                {errors.email && <p className="text-[12px] text-[var(--danger)]">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-[var(--text-primary)]">Password</label>
                  <Link href="#" className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors">Forgot password?</Link>
                </div>
                <Input type="password" placeholder="••••••••" {...register("password")} />
                {errors.password && <p className="text-[12px] text-[var(--danger)]">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
           </form>

           <div className="flex items-center my-6">
              <div className="flex-1 border-t border-[var(--border)]"></div>
              <span className="px-4 text-[11px] font-semibold text-[var(--text-muted)] uppercase">Or continue with</span>
              <div className="flex-1 border-t border-[var(--border)]"></div>
           </div>

           <Button 
              variant="secondary" 
              className="w-full h-11" 
              onClick={onGoogleLogin}
              disabled={isGoogleLoading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
           </Button>

           <p className="text-[13px] text-center text-[var(--text-secondary)] mt-8">
             Don't have an account? <Link href="/register" className="font-semibold text-[var(--text-primary)] hover:text-[var(--brand)] transition-colors">Register</Link>
           </p>
        </div>
      </div>
    </div>
  );
}
