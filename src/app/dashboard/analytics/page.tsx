"use client";

import { useAppStore } from "@/store/useAppStore";
import { mockCases, mockAlerts } from "@/lib/mocks/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileWarning, Eye, UserCheck, ArrowUpRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function AnimatedCounter({ end }: { end: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1000;
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
  const [dbCases, setDbCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        const querySnapshot = await getDocs(collection(db, "missingPersons"));
        const liveData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setDbCases(liveData);
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveStats();
  }, []);

  // Merge Mocks + DB
  const allCasesCombined = [...mockCases, ...dbCases];
  const activeCasesCount = allCasesCombined.filter(c => c.status === "Active").length;
  const recentAlerts = mockAlerts.slice(0, 5);

  const stats = [
    { label: "Total Cases", value: allCasesCombined.length, icon: Users, color: "text-[var(--info)]", bg: "bg-[var(--info-bg)]", trend: "+12%" },
    { label: "Active Tracking", value: activeCasesCount, icon: Eye, color: "text-[var(--warning)]", bg: "bg-[var(--warning-bg)]", trend: "+4%" },
    { label: "System Alerts", value: mockAlerts.length, icon: FileWarning, color: "text-[var(--danger)]", bg: "bg-[var(--danger-bg)]", trend: "+24%" },
    { label: "Recovered", value: allCasesCombined.filter(c => c.status === "Found").length, icon: UserCheck, color: "text-[var(--success)]", bg: "bg-[var(--success-bg)]", trend: "+18%" }
  ];

  const recentIntake = allCasesCombined.slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      {/* SaaS Stat Cards Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
           <Card key={i} className="hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--bg-elevated)] via-[var(--bg-subtle)] to-[var(--bg-elevated)] opacity-50" />
             <CardContent className="p-[20px] flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.06em]">{stat.label}</p>
                  <div className="flex items-baseline gap-3">
                     <h3 className="text-[32px] font-bold tracking-[-0.03em] leading-none text-[var(--text-primary)]">
                       <AnimatedCounter end={stat.value} />
                     </h3>
                     <span className="text-[12px] font-bold text-[var(--success)] bg-[var(--success-bg)] px-2 py-0.5 rounded-[999px] flex items-center">
                       {stat.trend} <ArrowUpRight className="w-3 h-3 ml-0.5" />
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
            <Card>
              <CardHeader className="border-b border-[var(--border)]">
                <CardTitle className="text-[var(--text-secondary)] font-semibold text-[15px]">Case Velocity (YTD)</CardTitle>
                <CardDescription>Metrics spanning the last 6 months of logging.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 pl-0 border-b-transparent">
                <div className="h-[300px] w-full min-h-[300px]">
                  <ResponsiveContainer width="99%" height={300}>
                    <BarChart data={[
                      { name: 'Jan', cases: 40 }, { name: 'Feb', cases: 30 }, { name: 'Mar', cases: 55 },
                      { name: 'Apr', cases: 45 }, { name: 'May', cases: 60 }, { name: 'Jun', cases: 35 },
                    ]}>
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

            <Card>
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
                     {recentIntake.map(c => (
                        <Link href={`/dashboard/cases/${c.id}`} key={c.id} className="flex items-center gap-4 p-4 hover:bg-[var(--bg-elevated)] transition-colors group cursor-pointer">
                           <img src={c.photoURL} alt={c.name} className="w-[40px] h-[40px] rounded-full object-cover border border-[var(--border)]" />
                           <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--brand)] transition-colors">{c.name}</p>
                              <p className="text-[12px] text-[var(--text-muted)] truncate">{c.lastSeenLocation}</p>
                           </div>
                           <Badge variant={c.status.toLowerCase() as any}>{c.status}</Badge>
                        </Link>
                     ))}
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Alert Feed Column */}
         <div className="space-y-6 lg:col-span-1 border border-[var(--border)] bg-[var(--bg-base)] p-6 rounded-[12px]">
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] flex items-center gap-2">
               <FileWarning className="w-4 h-4 text-[var(--danger)]" />
               Live Alert Feed
            </h3>
            
            <div className="space-y-4">
              {recentAlerts.map(alert => (
                 <div key={alert.id} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] p-[14px] hover:border-[var(--bg-subtle)] transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-2">
                           <div className="w-[32px] h-[32px] rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                              <img src={mockCases.find(c => c.id === alert.missingPersonId)?.photoURL} className="w-full h-full object-cover" />
                           </div>
                           <div>
                              <p className="text-[13px] font-bold text-[var(--text-primary)]">Cam: Node {alert.id.slice(-4)}</p>
                              <p className="text-[11px] text-[var(--text-muted)]">{new Date(alert.createdAt).toLocaleTimeString()}</p>
                           </div>
                         </div>
                         <Badge variant={alert.confidence > 85 ? "danger" : "warning"} className="text-[12px]">
                           {alert.confidence}%
                         </Badge>
                      </div>
                      
                      <div className="bg-[var(--bg-elevated)] rounded-[6px] p-2 border border-[var(--border)]">
                         <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2">
                           Facial match locked running real-time scan. Coordinates mapped to <span className="font-semibold text-[var(--text-primary)]">{alert.location}</span>.
                         </p>
                      </div>
                 </div>
              ))}

              <Button variant="secondary" className="w-full h-11 border border-[var(--border)] rounded-[8px]">
                Load More History
              </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
