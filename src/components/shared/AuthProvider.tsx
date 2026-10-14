"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Loader2 } from "lucide-react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeAuthListener, isLoading } = useAppStore();

  useEffect(() => {
    initializeAuthListener();
  }, [initializeAuthListener]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          <p className="text-sm text-slate-500">Authenticating session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
