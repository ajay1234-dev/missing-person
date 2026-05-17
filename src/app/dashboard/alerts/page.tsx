"use client";

import { useAppStore } from "@/store/useAppStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronDown, ChevronUp, BellRing } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Alert, MissingPersonCase } from "@/types";

export default function AlertsTimelinePage() {
  const { user } = useAppStore();
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cases, setCases] = useState<MissingPersonCase[]>([]);

  useEffect(() => {
    // Listen to Cases
    const unsubCases = onSnapshot(collection(db, "missingPersons"), (snapshot) => {
      const c = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as MissingPersonCase));
      setCases(c);
    });

    // Listen to Alerts
    const qAlerts = query(collection(db, "alerts"), orderBy("createdAt", "desc"));
    const unsubAlerts = onSnapshot(qAlerts, (snapshot) => {
      const a = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Alert));
      setAlerts(a);
    });

    return () => {
      unsubCases();
      unsubAlerts();
    };
  }, []);

  const updateAlertStatus = async (alert: Alert, status: "verified" | "false_alarm") => {
     try {
        await updateDoc(doc(db, "alerts", alert.id), { status });
        if (status === "verified") {
            await updateDoc(doc(db, "missingPersons", alert.missingPersonId), { status: "Found" });
        }
     } catch(e) {
        console.error("Error updating status", e);
     }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === "pending") return a.status === "pending";
    if (filter === "verified") return a.status === "verified";
    return true;
  });

  return (
    <div className="space-y-6 pb-12 w-full max-w-4xl mx-auto">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
         <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">System Alerts Log</h1>
            <p className="text-[14px] text-[var(--text-secondary)]">Chronological timeline of CCTV and Node inferences.</p>
         </div>
       </div>

       <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
         <Badge 
           variant={filter === "all" ? "default" : "outline"} 
           className="cursor-pointer" onClick={() => setFilter("all")}
         >
           All Feed
         </Badge>
         <Badge 
           variant={filter === "pending" ? "pending" : "outline"} 
           className="cursor-pointer" onClick={() => setFilter("pending")}
         >
           Pending Review
         </Badge>
         <Badge 
           variant={filter === "verified" ? "verified" : "outline"} 
           className="cursor-pointer" onClick={() => setFilter("verified")}
         >
           Verified Nodes
         </Badge>
       </div>

       <div className="relative pl-6">
          <div className="absolute left-0 top-3 bottom-0 w-[2px] bg-[var(--border)]" />
          
          <div className="space-y-6">
            {filteredAlerts.length === 0 && (
               <div className="pl-6 text-[14px] text-[var(--text-muted)] p-4 border border-dashed border-[var(--border)] rounded-[8px] inline-block bg-[var(--bg-elevated)]">
                 No alerts mapping to this matrix.
               </div>
            )}
            
            {filteredAlerts.map((alert) => {
               const person = cases.find(c => c.id === alert.missingPersonId);
               const isExpanded = expandedId === alert.id;
               
               let dotColor = "bg-[var(--warning)]";
               if (alert.status === "verified") dotColor = "bg-[var(--success)] shadow-[0_0_12px_var(--success)]";
               if (alert.status === "false_alarm") dotColor = "bg-[var(--danger)]";

               return (
                 <div key={alert.id} className="relative animate-fade-in-up">
                    <div className={`absolute -left-[29px] top-4 h-[10px] w-[10px] rounded-full border-2 border-[var(--bg-base)] ${dotColor} z-10`} />
                    
                    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[12px] shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300">
                       
                       <div 
                         className="p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 cursor-pointer"
                         onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                       >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-[42px] h-[42px] rounded-full bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
                               <BellRing className={`w-5 h-5 ${alert.status === 'pending' ? 'text-[var(--warning)]' : 'text-[var(--text-secondary)]'}`} />
                            </div>
                            <div className="min-w-0">
                               <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-[15px] font-bold text-[var(--text-primary)] truncate">Algorithm Match Triggered</h3>
                                  <Badge variant={alert.status.toLowerCase() as any} className="text-[10px] uppercase. h-[20px]">{alert.status}</Badge>
                               </div>
                               <p className="text-[13px] text-[var(--text-secondary)] truncate">
                                 Confidence limit breached: <span className="font-semibold text-[var(--text-primary)]">{alert.confidence}%</span>
                               </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0 text-[var(--text-muted)]">
                            <span className="text-[12px] font-medium">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                            {isExpanded ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                          </div>
                       </div>

                       {isExpanded && (
                         <div className="border-t border-[var(--border)] bg-[var(--bg-elevated)] p-5 animate-fade-in-up selection:bg-[var(--brand-glow)]">
                            <div className="grid sm:grid-cols-2 gap-6">
                               
                               <div className="space-y-4">
                                  <h4 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.06em]">Trace Data</h4>
                                  <div className="text-[13px] space-y-2">
                                     <p className="text-[var(--text-secondary)] flex items-center justify-between border-b border-[var(--border)] pb-2">
                                       <span>Status Block</span> <span className="font-medium text-[var(--text-primary)]">{alert.status.toUpperCase()}</span>
                                     </p>
                                     <p className="text-[var(--text-secondary)] flex items-center justify-between border-b border-[var(--border)] py-2">
                                       <span>Origin Node</span> <span className="font-medium inline-flex items-center gap-1 text-[var(--text-primary)]"><MapPin className="w-3 h-3 text-[var(--brand)]"/> {alert.location}</span>
                                     </p>
                                     <p className="text-[var(--text-secondary)] flex items-center justify-between border-b border-[var(--border)] py-2">
                                       <span>Algorithm Target</span> <Link href={`/dashboard/cases/${alert.missingPersonId}`} className="font-semibold text-[var(--brand)] hover:text-[var(--brand-dim)] transition-colors">{person?.name}</Link>
                                     </p>
                                  </div>
                               </div>

                               <div className="space-y-2">
                                  <h4 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.06em]">Visual Verification</h4>
                                  <div className="flex gap-2">
                                     <img src={person?.photoURL || "https://images.unsplash.com/photo-1544265538-4e55eec1cceb"} className="w-1/2 h-[120px] object-cover rounded-[6px] border border-[var(--border)] hover:brightness-110 transition-all" alt="Target" />
                                     <img src={alert.matchedImageURL} className="w-1/2 h-[120px] object-cover rounded-[6px] border border-[var(--border)] filter sepia-[0.3] hue-rotate-[180deg] saturate-[1.5] brightness-[0.8] contrast-[1.2] hover:brightness-100 transition-all" alt="CCTV Match" />
                                  </div>
                               </div>

                            </div>
                            
                            {alert.status === "pending" && user?.role === "admin" && (
                               <div className="mt-6 flex gap-2 justify-end pt-4 border-t border-[var(--border)]">
                                  <Button variant="danger" size="sm" onClick={() => updateAlertStatus(alert, "false_alarm")}>Tag Reject</Button>
                                  <Button size="sm" onClick={() => updateAlertStatus(alert, "verified")} className="bg-[var(--success)] text-white hover:bg-[var(--success)] mix-blend-plus-lighter">Confirm Target</Button>
                               </div>
                            )}
                         </div>
                       )}

                    </div>
                 </div>
               );
            })}
          </div>
       </div>
    </div>
  );
}
