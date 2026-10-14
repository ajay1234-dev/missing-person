"use client";

import Link from "next/link";
import { Shield, Target, Zap, Lock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--bg-base)] font-sans selection:bg-[var(--brand-glow)]">
      <header className="px-6 md:px-12 h-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-base)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--brand)] p-2 rounded-[8px] shadow-[0_0_20px_var(--brand-glow)]"><Shield className="text-white w-5 h-5"/></div>
          <span className="font-bold text-[18px] text-[var(--text-primary)] tracking-[-0.03em]">Findra AI</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Log In</Link>
          <Button asChild className="hidden sm:inline-flex" variant="secondary">
            <Link href="/register">Report a Person</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Full-screen Hero Section */}
        <section className="relative min-h-[calc(100vh-80px)] px-6 overflow-hidden flex flex-col items-center justify-center text-center">
          {/* Animated Background Grid */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,var(--bg-surface)_1px,transparent_1px),linear-gradient(to_bottom,var(--bg-surface)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--brand)]/10 rounded-full blur-[120px] z-0 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-5xl mx-auto space-y-10 mt-[-10vh] animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] mx-auto">
               <span className="flex h-2 w-2 rounded-full bg-[var(--success)] animate-pulse"></span>
               <span className="text-[12px] font-semibold tracking-wide text-[var(--text-secondary)] uppercase">Systems Active (v2.4.0)</span>
            </div>
            
            <h1 className="text-[56px] md:text-[80px] font-bold text-[var(--text-primary)] tracking-[-0.04em] leading-[1.05] mx-auto max-w-4xl">
              Find the missing. <br />
              <span className="text-[var(--brand)]">Faster.</span>
            </h1>
            
            <p className="text-[18px] text-[var(--text-secondary)] max-w-[520px] mx-auto leading-[1.6]">
              A globally synchronized intelligence network bridging families, NGOs, and law enforcement via instantaneous 128-dimensional facial pattern matching.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="h-[48px] px-8 text-[15px] shadow-[0_0_30px_-5px_var(--brand-glow)]">
                 <Link href="/register">Report a Person</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="h-[48px] px-8 text-[15px]">
                 <Link href="/login"><Lock className="w-4 h-4 mr-2"/> Law Enforcement Login</Link>
              </Button>
            </div>
          </div>

          {/* Animated Glowing Card behind UI */}
          <div className="absolute right-[10%] top-[40%] transform rotate-12 scale-90 md:scale-100 opacity-20 pointer-events-none animate-shimmer" style={{ animation: "float 6s ease-in-out infinite" }}>
             <div className="w-[280px] h-[360px] rounded-[16px] border border-[var(--brand)]/30 bg-[var(--bg-surface)] backdrop-blur-3xl shadow-[0_0_80px_var(--brand-glow)] p-6 flex flex-col gap-4 relative overflow-hidden">
                <div className="w-[80px] h-[80px] rounded-full bg-[var(--brand)]/20 mx-auto mt-4" />
                <div className="w-3/4 h-4 rounded mt-4 mx-auto bg-[var(--bg-elevated)]" />
                <div className="w-1/2 h-4 rounded mx-auto bg-[var(--bg-elevated)]" />
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--brand)] to-transparent" />
             </div>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes float {
              0% { transform: translateY(0px) rotate(12deg); }
              50% { transform: translateY(-20px) rotate(10deg); }
              100% { transform: translateY(0px) rotate(12deg); }
            }
          `}} />
        </section>

        {/* Stats Row */}
        <section className="border-y border-[var(--border)] bg-[var(--bg-surface)] py-16 relative z-10">
           <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
             <div className="pt-8 md:pt-0">
               <h3 className="text-[48px] font-bold text-[var(--text-primary)] tracking-[-0.04em]">99.8%</h3>
               <p className="text-[13px] text-[var(--text-muted)] font-semibold uppercase tracking-[0.08em] mt-2">Vector Accuracy</p>
             </div>
             <div className="pt-8 md:pt-0">
               <h3 className="text-[48px] font-bold text-[var(--text-primary)] tracking-[-0.04em]"><span className="text-[var(--brand)]">1.2</span>s</h3>
               <p className="text-[13px] text-[var(--text-muted)] font-semibold uppercase tracking-[0.08em] mt-2">Global Query Latency</p>
             </div>
             <div className="pt-8 md:pt-0">
               <h3 className="text-[48px] font-bold text-[var(--text-primary)] tracking-[-0.04em]">10M+</h3>
               <p className="text-[13px] text-[var(--text-muted)] font-semibold uppercase tracking-[0.08em] mt-2">CCTV Nodes Mapped</p>
             </div>
           </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6 max-w-6xl mx-auto space-y-20 bg-[var(--bg-base)]">
          <div className="text-center space-y-6">
            <h2 className="text-[40px] font-bold text-[var(--text-primary)] tracking-[-0.03em]">Engineered for speed.</h2>
            <p className="text-[18px] text-[var(--text-secondary)] max-w-2xl mx-auto">Instant geometric distance mapping securely partitioning inputs directly from family reports to investigating units.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Realtime CCTV Webhooks", desc: "Instantly lock missing identifiers into live feeds. Automated triggers parse video feeds against Euclidean maps.", icon: Target },
              { title: "Military Grade Isolation", desc: "Data explicitly sequestered. Family entries remain tightly bounded and read-only until an authority initiates verification.", icon: Shield },
              { title: "128-D Facial Extraction", desc: "Leverage mobile SSD neural nets dropping localized weights to execute ultra-fast client edge analysis.", icon: Zap },
              { title: "Instantaneous Alerting", desc: "Nodemailer dispatch networks immediately ping involved parties the moment a 70%+ confidence interval is breached.", icon: Bell }
            ].map((f, i) => (
              <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[12px] p-8 hover:bg-[var(--bg-elevated)] transition-all duration-300 group cursor-pointer">
                <div className="bg-[var(--bg-elevated)] w-[48px] h-[48px] rounded-full flex items-center justify-center mb-6 group-hover:bg-[var(--brand)] transition-colors">
                  <f.icon className="text-[var(--text-primary)] w-5 h-5 group-hover:text-white" />
                </div>
                <h3 className="text-[20px] font-bold text-[var(--text-primary)] mb-3">{f.title}</h3>
                <p className="text-[15px] text-[var(--text-secondary)] leading-[1.6]">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <footer className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
           <div className="flex items-center gap-3 mb-6 md:mb-0">
            <Shield className="text-[var(--text-muted)] w-5 h-5"/>
            <span className="font-semibold text-[14px] text-[var(--text-muted)]">Findra AI © 2026</span>
          </div>
          <p className="text-[13px] text-[var(--text-muted)]">Secure Intelligence Tooling.</p>
        </div>
      </footer>
    </div>
  );
}
