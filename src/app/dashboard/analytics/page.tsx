"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileWarning, Eye, UserCheck, ArrowUpRight, Loader2, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { MissingPersonCase, Alert } from "@/types";

function AnimatedCounter({ end }: { end: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    if (end === 0) {
      setCount(0);
      return;
    }
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end]);
  
  return <>{count}</>;
}

export default function AnalyticsDashboard() {
  const [cases, setCases] = useState<MissingPersonCase[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Cases
    const qCases = query(collection(db, "missingPersons"), orderBy("reportedAt", "desc"));
    const unsubCases = onSnapshot(qCases, (snapshot) => {
      const c = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as MissingPersonCase));
      setCases(c);
      setLoading(false);
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

  // Compute stats
  const activeCasesCount = cases.filter(c => c.status === "Active").length;
  const recoveredCasesCount = cases.filter(c => c.status === "Found").length;
  
  const stats = [
    { label: "Total Cases", value: cases.length, icon: Users, color: "text-[var(--info)]", bg: "bg-[var(--info-bg)]", trend: "Live SYNC" },
    { label: "Active Tracking", value: activeCasesCount, icon: Eye, color: "text-[var(--warning)]", bg: "bg-[var(--warning-bg)]", trend: "Live SYNC" },
    { label: "System Alerts", value: alerts.length, icon: FileWarning, color: "text-[var(--danger)]", bg: "bg-[var(--danger-bg)]", trend: "Live SYNC" },
    { label: "Recovered", value: recoveredCasesCount, icon: UserCheck, color: "text-[var(--success)]", bg: "bg-[var(--success-bg)]", trend: "Live SYNC" }
  ];

  const recentIntake = cases.slice(0, 4);
  const recentAlerts = alerts.slice(0, 5);

  // Compute dynamic bar chart data (last 6 months)
  const chartData = useMemo(() => {
     const data: { name: string, cases: number, monthNum: number, year: number }[] = [];
     const now = new Date();
     
     // Initialize the last 6 months buckets
     for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });
        data.push({ name: monthName, cases: 0, monthNum: d.getMonth(), year: d.getFullYear() });
     }
     
     // Populate buckets
     cases.forEach(c => {
         const d = new Date(c.reportedAt);
         const targetBucket = data.find(b => b.monthNum === d.getMonth() && b.year === d.getFullYear());
         if (targetBucket) targetBucket.cases++;
     });
     
     return data;
  }, [cases]);

  if (loading) {
     return (
       <div className="flex h-[400px] items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
       </div>
     );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* SaaS Stat Cards Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
           <Card key={i} className="hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden bg-[var(--bg-surface)]">
             <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--bg-elevated)] via-[var(--bg-subtle)] to-[var(--bg-elevated)] opacity-50" />
             <CardContent className="p-[20px] flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.06em]">{stat.label}</p>
                  <div className="flex items-baseline gap-3">
                     <h3 className="text-[32px] font-bold tracking-[-0.03em] leading-none text-[var(--text-primary)]">
                       <AnimatedCounter end={stat.value} />
                     </h3>
                     <span className="text-[9px] font-bold text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border)] px-2 py-0.5 rounded-[999px] flex items-center uppercase tracking-widest gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shadow-[0_0_8px_var(--success)] animate-[pulse_2s_infinite]"></span> {stat.trend}
                     </span>
                  </div>
                </div>
                <div className={`h-[48px] w-[48px] rounded-full flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
             </CardContent>
           </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Chart Area */}
         <div className="lg:col-span-2 space-y-8">
            <Card className="bg-[var(--bg-surface)]">
              <CardHeader className="border-b border-[var(--border)]">
                <CardTitle className="text-[var(--text-secondary)] font-semibold text-[15px]">Case Velocity (YTD)</CardTitle>
                <CardDescription>Live reporting metrics spanning the last 6 calendar months.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 pl-0 border-b-transparent">
                <div className="h-[300px] w-full min-h-[300px]">
                  <ResponsiveContainer width="99%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dx={-10} />
                      <RechartsTooltip 
                        cursor={{fill: 'var(--bg-elevated)'}} 
                        contentStyle={{borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'}} 
                        itemStyle={{color: 'var(--text-primary)'}}
                      />
                      <Bar dataKey="cases" fill="var(--brand)" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--bg-surface)]">
               <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--border)]">
                 <div>
                   <CardTitle className="text-[var(--text-secondary)] font-semibold text-[15px]">Recent Case Intake</CardTitle>
                   <CardDescription>Most recently added files to the vector database.</CardDescription>
                 </div>
                 <Link href="/dashboard/cases" className="text-[13px] font-semibold text-[var(--brand)] hover:text-[var(--brand-dim)] transition-colors">
                   View all
                 </Link>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-[var(--border)]">
                     {recentIntake.length === 0 && (
                        <div className="p-8 text-center text-[13px] text-[var(--text-muted)]">No active cases mapped in the system.</div>
                     )}
                     {recentIntake.map(c => (
                        <Link href={`/dashboard/cases/${c.id}`} key={c.id} className="flex items-center gap-4 p-4 hover:bg-[var(--bg-elevated)] transition-colors group cursor-pointer">
                           <img src={c.photoURL || "https://images.unsplash.com/photo-1544265538-4e55eec1cceb"} alt={c.name} className="w-[40px] h-[40px] rounded-full object-cover border border-[var(--border)]" />
                           <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--brand)] transition-colors">{c.name}</p>
                              <div className="flex items-center gap-1 text-[12px] text-[var(--text-muted)] mt-0.5">
                                 <MapPin className="w-3 h-3"/> <span className="truncate">{c.lastSeenLocation}</span>
                              </div>
                           </div>
                           <Badge variant={c.status.toLowerCase() as any}>{c.status}</Badge>
                        </Link>
                     ))}
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Alert Feed Column */}
         <div className="space-y-6 lg:col-span-1 border border-[var(--border)] bg-[var(--bg-base)] p-6 rounded-[12px] shadow-inner">
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] flex items-center justify-between">
               <span className="flex items-center gap-2"><FileWarning className="w-4 h-4 text-[var(--danger)]" /> Live Alert Feed</span>
               <span className="relative flex h-2 w-2 mr-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--danger)] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--danger)]"></span></span>
            </h3>
            
            <div className="space-y-4">
              {recentAlerts.length === 0 && (
                 <div className="p-6 border border-dashed border-[var(--border-strong)] rounded-[8px] text-center text-[13px] text-[var(--text-muted)]">
                    No verified or pending alerts currently broadcasted.
                 </div>
              )}
              {recentAlerts.map(alert => {
                 const target = cases.find(c => c.id === alert.missingPersonId);
                 
                 return (
                 <Link href="/dashboard/alerts" key={alert.id} className="block bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] p-[14px] hover:border-[var(--brand-dim)] hover:shadow-[0_0_15px_var(--brand-glow)] transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-3">
                           <div className="w-[36px] h-[36px] rounded-full bg-[var(--bg-elevated)] overflow-hidden border border-[var(--border)]">
                              <img src={target?.photoURL || alert.matchedImageURL || "https://images.unsplash.com/photo-1544265538-4e55eec1cceb"} className="w-full h-full object-cover" />
                           </div>
                           <div>
                              <p className="text-[13px] font-bold text-[var(--text-primary)]">{target?.name || "Unknown Target"}</p>
                              <p className="text-[11px] font-medium text-[var(--text-muted)]">{new Date(alert.createdAt).toLocaleTimeString()}</p>
                           </div>
                         </div>
                         <Badge variant={alert.confidence > 85 ? "danger" : "warning"} className="text-[11px] font-black h-[22px] px-1.5 shadow-sm">
                           {alert.confidence}%
                         </Badge>
                      </div>
                      
                      <div className="bg-[var(--bg-elevated)] rounded-[6px] p-2.5 border border-[var(--border)]">
                         <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                           Facial match locked in active scan. Coordinates mapped to: <span className="font-semibold text-[var(--text-primary)] block mt-0.5">{alert.location}</span>
                         </p>
                      </div>
                 </Link>
              )})}

              {recentAlerts.length > 0 && (
                 <Link href="/dashboard/alerts" className="block">
                    <Button variant="secondary" className="w-full h-11 border border-[var(--border)] rounded-[8px] mt-2 group hover:border-[var(--brand)] transition-colors">
                      Open Alert Dispatch <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                 </Link>
              )}
            </div>
         </div>
      </div>
    </div>
  );
}
