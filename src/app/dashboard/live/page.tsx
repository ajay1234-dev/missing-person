"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MissingPersonCase } from "@/types";
import { MapPin, Target, Activity, AlertTriangle, Disc, Video, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function LiveCCTVMonitorPage() {
  const [isScanning, setIsScanning] = useState(true);
  const [logs, setLogs] = useState<{ id: string, time: string, message: string, type: 'info'|'match'|'scan' }[]>([]);
  const [cases, setCases] = useState<MissingPersonCase[]>([]);
  const [activeNodes, setActiveNodes] = useState(128);

  useEffect(() => {
     const fetchCases = async () => {
        const querySnapshot = await getDocs(collection(db, "missingPersons"));
        setCases(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as MissingPersonCase)));
     };
     fetchCases();
  }, []);

  const addLog = (message: string, type: 'info'|'match'|'scan') => {
     setLogs(prev => {
        const newLogs = [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), message, type }, ...prev];
        return newLogs.slice(0, 15);
     });
  };

  useEffect(() => {
     if (!isScanning) return;

     addLog("Live node connection established. Monitoring incoming streams...", "info");

     const scanInterval = setInterval(() => {
        addLog(`Analyzing frame sequence from Node Alpha-${Math.floor(Math.random() * 100)}...`, "scan");

        // Small random chance to trigger a match simulation (if we have cases)
        if (cases.length > 0 && Math.random() > 0.8) {
           const randomCase = cases[Math.floor(Math.random() * cases.length)];
           const confidence = Math.floor(Math.random() * (99 - 82 + 1) + 82);
           const alertId = `live_alert_${Date.now()}`;
           
           addLog(`CRITICAL: Vector match detected! Target: ${randomCase.name} (${confidence}% confidence)`, "match");
           toast.error(`Live match detected: ${randomCase.name}`);
           
           // Push actual alert to Firebase
           setDoc(doc(db, "alerts", alertId), {
              id: alertId,
              missingPersonId: randomCase.id,
              matchedImageURL: randomCase.photoURL || "https://images.unsplash.com/photo-1544265538-4e55eec1cceb", // Mocking CCTV capture with original for demo
              location: `Live CCTV Node Alpha-${Math.floor(Math.random() * 100)}`,
              confidence: confidence,
              status: "pending",
              createdAt: new Date().toISOString()
           }).catch(e => console.error("Could not write alert to DB", e));
        }
     }, 4000);

     // Minor node fluctuation simulation
     const nodeInterval = setInterval(() => {
        setActiveNodes(prev => prev + (Math.floor(Math.random() * 5) - 2));
     }, 6000);

     return () => {
        clearInterval(scanInterval);
        clearInterval(nodeInterval);
     };
  }, [isScanning, cases]);

  return (
    <div className="space-y-6 pb-12 w-full max-w-6xl mx-auto text-[var(--text-primary)]">
      
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
         <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">Live Realtime Monitor</h1>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--danger)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--danger)]"></span>
              </span>
            </div>
            <p className="text-[14px] text-[var(--text-secondary)]">Continuously authenticating live CCTV frames against global vectors.</p>
         </div>
       </div>

       <div className="grid lg:grid-cols-3 gap-6">
          
          {/* STATS COLUMN */}
          <div className="flex flex-col gap-6">
             <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[14px] p-6 shadow-card">
               <h3 className="text-[12px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-4 flex items-center gap-2"><Disc className="w-4 h-4 text-[var(--brand)] animate-spin-slow"/> Network Status</h3>
               <div className="text-[36px] font-bold leading-none mb-1 text-[var(--brand)]">{activeNodes}</div>
               <div className="text-[14px] text-[var(--text-secondary)] font-medium">Active CCTV Nodes Connected</div>
             </div>

             <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[14px] p-6 shadow-card">
               <h3 className="text-[12px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-[var(--warning)]"/> Target Matrix</h3>
               <div className="text-[36px] font-bold leading-none mb-1 text-[var(--warning)]">{cases.length}</div>
               <div className="text-[14px] text-[var(--text-secondary)] font-medium">Missing Persons Vectors Loaded</div>
             </div>

             <button 
                onClick={() => setIsScanning(!isScanning)}
                className={`w-full py-4 rounded-[10px] font-bold uppercase tracking-wider text-[13px] border-2 transition-all duration-300 shadow-sm
                  ${isScanning ? 'border-[var(--danger)] bg-[var(--danger)] text-white hover:bg-transparent hover:text-[var(--danger)]' : 'border-[var(--success)] bg-[var(--success)] text-white hover:bg-transparent hover:text-[var(--success)]'}`}
             >
                {isScanning ? 'Halt Surveillance' : 'Initiate Live Feed'}
             </button>
          </div>

          {/* VISUAL MONITOR */}
          <div className="lg:col-span-2 flex flex-col h-[500px] bg-[var(--bg-surface)] border border-[var(--border)] rounded-[14px] shadow-card overflow-hidden relative group">
             
             {/* Map Overlay Simulation */}
             <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen bg-[linear-gradient(to_right,var(--brand)_1px,transparent_1px),linear-gradient(to_bottom,var(--brand)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
             
             {isScanning ? (
                <div className="absolute inset-0 z-0">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full border border-[var(--brand)] opacity-20 animate-[ping_4s_ease-out_infinite]"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full border border-[var(--brand)] opacity-40 animate-[ping_4s_ease-out_infinite_1s]"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 rounded-full border border-[var(--brand)] opacity-60 animate-[ping_4s_ease-out_infinite_2s]"></div>
                  
                  {/* Sweep Line */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-gradient-to-b from-transparent via-[var(--brand)] to-transparent origin-bottom animate-[spin_3s_linear_infinite]" style={{ transformOrigin: '0 50%' }}></div>
                </div>
             ) : (
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                   <Target className="w-24 h-24 text-[var(--text-muted)] opacity-20" />
                </div>
             )}

             {/* Terminal Header */}
             <div className="relative z-10 bg-black/60 backdrop-blur-md border-b border-[var(--border)] p-4 flex justify-between items-center text-[12px] font-mono text-[var(--brand-dim)]">
                <div className="flex gap-4">
                  <span className="flex items-center gap-2"><Video className="w-4 h-4"/> STREAM_MUX_01</span>
                  <span className="flex items-center gap-2"><Activity className="w-4 h-4"/> CPU: 34%</span>
                </div>
                <span>UPTIME: {new Date().toISOString().split('T')[0]}</span>
             </div>

             {/* Event Logs */}
             <div className="relative z-10 flex-1 p-6 flex flex-col justify-end">
                <div className="space-y-3 font-mono text-[13px] md:text-[14px]">
                   {logs.slice().reverse().map((log, i) => (
                      <div key={log.id} className="animate-fade-in-up flex gap-4">
                         <span className="text-[var(--text-muted)] whitespace-nowrap">[{log.time}]</span>
                         <span className={`
                            ${log.type === 'match' ? 'text-[var(--danger)] font-bold' : ''}
                            ${log.type === 'scan' ? 'text-[var(--brand)]' : ''}
                            ${log.type === 'info' ? 'text-[var(--text-secondary)]' : ''}
                         `}>
                         {log.type === 'match' && <AlertTriangle className="w-4 h-4 inline mr-2 align-middle -mt-1 animate-pulse" />}
                         {log.type === 'scan' && '> '}
                         {log.message}
                         </span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

       </div>
    </div>
  );
}
