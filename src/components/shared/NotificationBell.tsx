"use client";

import { Bell } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { mockAlerts } from "@/lib/mocks/data";
import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";

export function NotificationBell() {
  const { user } = useAppStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unread = mockAlerts.filter(a => a.status === "pending").length;
    setUnreadCount(unread);
  }, []);

  if (!user) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-subtle)] transition-colors focus-ring"
      >
        <Bell className="h-4 w-4 text-[var(--text-secondary)]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-[8px] w-[8px] rounded-full bg-[var(--danger)] border-2 border-[var(--bg-surface)]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[120%] mt-2 w-80 rounded-[14px] bg-[var(--bg-elevated)] shadow-modal z-50 border border-[var(--border-strong)] overflow-hidden animate-fade-in-up">
          <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
            <h4 className="font-semibold text-[14px] text-[var(--text-primary)]">Notifications</h4>
            <button className="text-[12px] font-medium text-[var(--brand)] hover:text-[var(--brand-dim)] cursor-pointer" onClick={() => setUnreadCount(0)}>
              Mark all
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {mockAlerts.length > 0 ? (
              mockAlerts.map(alert => (
                <div key={alert.id} className="flex flex-col gap-1 p-3 hover:bg-[var(--bg-surface)] rounded-lg transition-colors cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">AI Match Alert</span>
                    <Badge variant={alert.confidence > 85 ? "danger" : "warning"}>
                      {alert.confidence}%
                    </Badge>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    Camera triggered pattern lock at <span className="font-medium">{alert.location}</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-center text-[var(--text-muted)] py-8">Inbox Zero</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
