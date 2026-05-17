"use client";

import { use, useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { mockCases, mockAlerts } from "@/lib/mocks/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Edit, BellRing, UserCircle, Phone, Loader2 } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CaseDetailPage(props: PageProps) {
  const resolvedParams = use(props.params); 
  const { user } = useAppStore();
  const isAdmin = user?.role === "admin";
  
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      // Check mocks first
      const mockPerson = mockCases.find(p => p.id === resolvedParams.id);
      if (mockPerson) {
        setPerson(mockPerson);
        setLoading(false);
        return;
      }
      
      // Fallback to Firebase for newly created reports
      try {
        const caseDoc = await getDoc(doc(db, "missingPersons", resolvedParams.id));
        if (caseDoc.exists()) {
          setPerson({ ...caseDoc.data(), id: caseDoc.id });
        }
      } catch (err) {
        console.error("Failed to fetch case", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [resolvedParams.id]);

  const relatedAlerts = mockAlerts.filter(a => a.missingPersonId === resolvedParams.id);

  if (loading) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center text-[var(--text-muted)] animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--brand)]" />
        <p className="text-[14px] font-semibold tracking-wide uppercase">Connecting to Node...</p>
      </div>
    );
  }

  if (!person) {
    return <div className="text-center py-20 text-[var(--text-muted)] font-medium">Node extraction invalid. Case offline or inaccessible.</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
       
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <Link href="/dashboard/cases" className="text-[13px] font-semibold text-[var(--brand)] hover:text-[var(--brand-dim)] bg-[var(--brand-glow)] px-3 py-1.5 rounded-full transition-all">← Directory</Link>
             <h1 className="text-[18px] font-bold text-[var(--text-primary)]">Node <span className="font-mono text-[var(--text-muted)]">#{person.id.slice(-6)}</span></h1>
          </div>
          {isAdmin && (
             <Button variant="secondary" className="h-9"><Edit className="w-4 h-4 mr-2"/> Edit Parameters</Button>
          )}
       </div>

       <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Profile Column */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-[var(--bg-surface)] rounded-[14px] border border-[var(--border)] overflow-hidden shadow-card animate-fade-in-up">
                <div className="w-full aspect-square relative border-b border-[var(--border)]">
                   <img src={person.photoURL} alt={person.name} className="w-full h-full object-cover" />
                   <div className="absolute top-4 right-4">
                      <Badge variant={person.status.toLowerCase() as any} className="shadow-lg backdrop-blur-md bg-opacity-90">{person.status}</Badge>
                   </div>
                </div>
                
                <div className="p-6">
                   <h2 className="text-[24px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">{person.name}</h2>
                   <p className="text-[15px] font-medium text-[var(--text-secondary)]">{person.age} years old • {person.gender}</p>
                   
                   <div className="mt-6 flex flex-col gap-3 pt-6 border-t border-[var(--border)]">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-[var(--brand)] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Coordinates</p>
                          <p className="text-[14px] text-[var(--text-primary)] mt-0.5">{person.lastSeenLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-[var(--brand)] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Timestamp</p>
                          <p className="text-[14px] text-[var(--text-primary)] mt-0.5">{new Date(person.lastSeenDate).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <UserCircle className="w-4 h-4 text-[var(--brand)] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Reporter UID</p>
                          <p className="text-[14px] text-[var(--text-primary)] mt-0.5 font-mono">{person.reportedBy}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-[var(--brand)] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Callback Line</p>
                          <p className="text-[14px] text-[var(--text-primary)] mt-0.5">{person.contactNumber}</p>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Details & Timeline Column */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* Modifiers Card */}
             <div className="bg-[var(--bg-surface)] rounded-[14px] border border-[var(--border)] p-6 shadow-card animate-fade-in-up">
                <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-4">Physical Modifiers</h3>
                <div className="bg-[var(--bg-elevated)] p-4 rounded-[8px] border border-[var(--border)]">
                   <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{person.description}</p>
                </div>
             </div>

             {/* Specific Alerts Timeline */}
             <div className="bg-[var(--bg-surface)] rounded-[14px] border border-[var(--border)] p-6 shadow-card animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[16px] font-bold text-[var(--text-primary)]">Node Target Triggers</h3>
                  <Badge variant="outline" className="text-[10px] font-mono">{relatedAlerts.length} logs</Badge>
                </div>

                <div className="space-y-4">
                   {relatedAlerts.length === 0 ? (
                      <p className="text-[13px] text-[var(--text-muted)] p-4 text-center border border-dashed border-[var(--border)] rounded-[8px]">
                        No triggers associated with this node.
                      </p>
                   ) : (
                     relatedAlerts.map(alert => (
                        <div key={alert.id} className="flex gap-4 p-4 rounded-[10px] bg-[var(--bg-elevated)] border border-[var(--border)]">
                          <div className="w-[36px] h-[36px] rounded-full bg-[var(--brand-glow)] flex items-center justify-center shrink-0">
                            <BellRing className="w-4 h-4 text-[var(--brand)]" />
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-[14px] font-bold text-[var(--text-primary)]">Vector Match: {alert.location}</h4>
                                  <p className="text-[13px] text-[var(--warning)] font-medium mt-0.5">Confidence: {alert.confidence}%</p>
                                </div>
                                <Badge variant={alert.status.toLowerCase() as any} className="text-[10px] uppercase border-[rgba(255,255,255,0.1)]">{alert.status}</Badge>
                             </div>
                             <p className="text-[11px] font-mono font-medium text-[var(--text-muted)] mt-3 tracking-widest">{new Date(alert.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                     ))
                   )}
                </div>
             </div>

          </div>
       </div>
    </div>
  );
}
