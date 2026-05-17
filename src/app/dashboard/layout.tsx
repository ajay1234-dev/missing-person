"use client";

import { Sidebar } from "@/components/shared/Sidebar";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { useAppStore } from "@/store/useAppStore";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAppStore();
  const pathname = usePathname();
  
  const getPageTitle = (path: string) => {
    if (path.includes("cases/")) return "Case Details";
    if (path.includes("cases")) return "Missing Persons";
    if (path.includes("report")) return "Report Person";
    if (path.includes("scan")) return "CCTV Scan";
    if (path.includes("alerts")) return "Alerts Feed";
    if (path.includes("analytics")) return "Command Center";
    return "Dashboard";
  };
  
  const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : "US";

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex w-0 flex-1 flex-col overflow-hidden pb-16 sm:pb-0">
        
        {/* Top Navbar */}
        <header className="relative z-10 flex h-[56px] shrink-0 bg-[var(--bg-surface)] border-b border-[var(--border)] items-center justify-between px-6 transition-colors duration-200">
          <div className="flex items-center">
             <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">{getPageTitle(pathname)}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-[36px] w-[36px] rounded-full bg-[var(--brand)] flex items-center justify-center text-white text-[13px] font-bold tracking-wider shadow-sm select-none border-2 border-transparent">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Main Content Pane */}
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-8 px-6 lg:px-8 max-w-7xl mx-auto w-full animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
