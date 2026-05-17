"use client";

import { useState } from "react";
import Link from "next/link";
import { mockCases } from "@/lib/mocks/data";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar } from "lucide-react";

export default function CasesDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredCases = mockCases.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
       
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">Global Database</h1>
            <p className="text-[14px] text-[var(--text-secondary)]">Directory of active and resolved system entities.</p>
         </div>
         <Button className="hidden md:flex">Export CSV</Button>
       </div>

       {/* Sticky Filter Bar */}
       <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-2 rounded-[10px] flex flex-col md:flex-row gap-3 sticky top-0 z-10 shadow-sm">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
           <Input 
             placeholder="Search identifiers by name..." 
             className="pl-9 border-transparent focus:border-[var(--brand)] h-[38px] w-full bg-[var(--bg-elevated)]"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
         <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-1 md:pb-0 scrollbar-hide shrink-0">
           {["All", "Active", "Found", "Closed"].map((status) => (
             <button
               key={status}
               onClick={() => setFilterStatus(status)}
               className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
                 filterStatus === status 
                  ? "bg-[var(--brand)] text-white" 
                  : "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
               }`}
             >
               {status}
             </button>
           ))}
         </div>
       </div>

       {/* Cases Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
         {filteredCases.map(c => (
           <Link href={`/dashboard/cases/${c.id}`} key={c.id} className="block group animate-fade-in-up">
             <Card className="h-full hover:shadow-card-hover group-hover:-translate-y-1 overflow-hidden transition-all duration-200">
                <div className="h-[180px] w-full relative overflow-hidden bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                   <img 
                     src={c.photoURL} 
                     alt={c.name} 
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                   />
                   <div className="absolute top-3 right-3 shadow-sm">
                      <Badge variant={c.status.toLowerCase() as any}>{c.status}</Badge>
                   </div>
                </div>
                <CardContent className="p-5 space-y-3">
                   <div>
                     <h3 className="font-bold text-[16px] text-[var(--text-primary)] leading-tight truncate px-1 group-hover:text-[var(--brand)] transition-colors">{c.name}</h3>
                     <p className="text-[13px] text-[var(--text-secondary)] font-medium px-1 mt-0.5">{c.age} years old • {c.gender}</p>
                   </div>
                   
                   <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
                      <div className="flex items-start gap-2 text-[12px] text-[var(--text-muted)]">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{c.lastSeenLocation}</span>
                      </div>
                      <div className="flex items-start gap-2 text-[12px] text-[var(--text-muted)]">
                        <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{new Date(c.lastSeenDate).toLocaleDateString()}</span>
                      </div>
                   </div>
                </CardContent>
             </Card>
           </Link>
         ))}
       </div>

       {filteredCases.length === 0 && (
         <div className="text-center py-20 border border-dashed border-[var(--border-strong)] rounded-[10px]">
           <p className="text-[14px] text-[var(--text-muted)] font-medium">No files matching the query criteria.</p>
         </div>
       )}
    </div>
  );
}
