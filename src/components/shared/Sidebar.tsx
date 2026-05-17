"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Target, Bell, FileSearch, Home, Shield, LogOut, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAppStore();

  const allLinks = [
    { name: "Overview", href: "/dashboard/analytics", icon: Home, roles: ["admin"] },
    { name: "Cases", href: "/dashboard/cases", icon: Users, roles: ["family", "ngo", "admin"] },
    { name: "Report Case", href: "/dashboard/report", icon: FileSearch, roles: ["family", "ngo", "admin"] },
    { name: "CCTV Scan", href: "/dashboard/scan", icon: Target, roles: ["ngo", "admin"] },
    { name: "Live Monitor", href: "/dashboard/live", icon: Radio, roles: ["admin"] },
    { name: "Alerts", href: "/dashboard/alerts", icon: Bell, roles: ["family", "ngo", "admin"] },
  ];

  const links = allLinks.filter(link => link.roles.includes(user?.role || "family"));

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden sm:flex flex-col w-[240px] bg-[var(--bg-surface)] border-r border-[var(--border)] shrink-0 h-full p-4 select-none relative z-20">
        <div className="pb-6 pt-2 px-3 flex items-center gap-2">
          <div className="bg-[var(--brand)] p-1.5 rounded-lg shadow-sm"><Shield className="text-white w-4 h-4"/></div>
          <span className="font-bold text-[16px] text-[var(--text-primary)] tracking-[-0.02em]">FindSystem AI</span>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 pt-2">
             <p className="text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.08em] uppercase">Core Platform</p>
          </div>
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[14px] font-medium transition-all duration-150",
                  isActive 
                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] border-l-[2px] border-[var(--brand)]" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] border-l-[2px] border-transparent"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-[var(--brand)]" : "text-[var(--text-secondary)]")} />
                {link.name}
              </Link>
            );
          })}
        </div>
        
        <div className="pt-4 border-t border-[var(--border)] mt-auto">
           <button 
             onClick={logout}
             className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[14px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all duration-150"
           >
             <LogOut className="w-4 h-4 text-[var(--text-muted)]" />
             Sign Out
           </button>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-surface)] border-t border-[var(--border)] z-50 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all",
                isActive ? "text-[var(--brand)]" : "text-[var(--text-secondary)]"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-[var(--brand-glow)]")} />
              <span className="text-[10px] font-medium">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
