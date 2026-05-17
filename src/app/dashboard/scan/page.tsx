"use client";

import { useState, useRef } from "react";
import { UploadCloud, Search, Target, Hexagon } from "lucide-react";
import { mockupVectorDatabase, euclideanDistance } from "@/lib/mockAI";
import { mockCases } from "@/lib/mocks/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

export default function CCTVScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<{ id: string, name: string, confidence: number, photo: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setResults([]);
    };
    reader.readAsDataURL(selected);
  };

  const executeScan = async () => {
    if (!file) {
      toast.error("Valid image parameter required.");
      return;
    }
    
    setIsScanning(true);
    setResults([]);

    try {
      const { collection, getDocs, doc, setDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      const querySnapshot = await getDocs(collection(db, "missingPersons"));
      const dbCases = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

      setTimeout(async () => {
        let matches = [];
        // Simulate high-fidelity extraction
        for (let data of dbCases as any[]) {
           // Simulating distance check against real database images
           const c = Math.floor(Math.random() * (98 - 72 + 1) + 72); 
           if (c > 75) {
              matches.push({
                id: data.id,
                name: data.name,
                confidence: c,
                photo: data.photoURL
              });
              
              if (c > 80) {
                 const alertId = `alert_${Date.now()}_${data.id}`;
                 setDoc(doc(db, "alerts", alertId), {
                    id: alertId,
                    missingPersonId: data.id,
                    matchedImageURL: preview,
                    location: "CCTV Node Alpha-Manual",
                    confidence: c,
                    status: "pending",
                    createdAt: new Date().toISOString()
                 });
              }
           }
        }
        
        matches.sort((a,b) => b.confidence - a.confidence);
        setResults(matches);
        setIsScanning(false);
        
        if (matches.length > 0) {
           toast.success("Algorithm executed. Targets matched.");
        } else {
           toast.info("No vectors met threshold.");
        }
      }, 2500);
    } catch (err) {
      toast.error("Global database connection failed.");
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-6xl mx-auto">
      
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
         <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">CCTV Origin Scanner</h1>
            <p className="text-[14px] text-[var(--text-secondary)]">Cross-reference localized imagery against the 128-D global node array.</p>
         </div>
       </div>

       <div className="grid lg:grid-cols-2 gap-6 w-full">
         
         {/* Left: Upload Interface */}
         <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[14px] shadow-card flex flex-col items-center justify-center p-8 min-h-[450px]">
            {!preview ? (
              <div 
                 onClick={() => fileInputRef.current?.click()} 
                 className="group border border-dashed border-[var(--border-strong)] hover:border-[var(--brand)] rounded-[12px] w-full max-w-[400px] aspect-video flex flex-col items-center justify-center cursor-pointer transition-all bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] hover:shadow-card mb-8"
              >
                 <div className="w-[64px] h-[64px] rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Search className="w-8 h-8 text-[var(--text-muted)] group-hover:text-[var(--brand)]" />
                 </div>
                 <span className="text-[14px] font-bold text-[var(--text-primary)]">Initialize Node Match</span>
                 <span className="text-[12px] text-[var(--text-muted)] mt-1">Drag & Drop CCTV capture</span>
              </div>
            ) : (
              <div className="relative w-full max-w-[400px] aspect-video rounded-[12px] overflow-hidden group border border-[var(--border)] mb-8 shadow-card">
                 <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                 
                 {isScanning && (
                   <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-center pointer-events-none">
                     <div className="absolute inset-0 bg-gradient-to-b from-[var(--brand-glow)] via-[var(--brand)] to-[var(--brand-glow)] opacity-40 animate-scan-line"></div>
                     <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--brand-dim)_1px,transparent_1px),linear-gradient(to_bottom,var(--brand-dim)_1px,transparent_1px)] bg-[size:10px_10px] opacity-20 pointer-events-none mix-blend-screen"></div>
                   </div>
                 )}
                 
                 {!isScanning && (
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <Button variant="danger" size="sm" onClick={() => { setFile(null); setPreview(null); setResults([]); }}>Eject Imagery</Button>
                   </div>
                 )}
              </div>
            )}
            
            <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={handleFile} />
            
            <Button 
               onClick={executeScan} 
               disabled={!file || isScanning}
               className="w-full max-w-[400px] h-[48px] text-[15px] font-bold"
            >
               {isScanning ? (
                 <>
                   <Target className="w-5 h-5 mr-3 animate-pulse" /> Resolving Matrices...
                 </>
               ) : "Execute Scan Protocol"}
            </Button>
         </div>

         {/* Right: Output Interface */}
         <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[14px] shadow-card flex flex-col p-6 min-h-[450px]">
            
            {results.length > 0 ? (
               <div className="w-full h-full flex flex-col animate-fade-in-up">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
                     <h3 className="font-bold text-[14px] text-[var(--text-primary)]">Algorithm Results</h3>
                     <Badge variant="verified" className="text-[10px] uppercase">
                       {results.length} Nodes Identified
                     </Badge>
                  </div>
                  
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                     {results.map((r, i) => (
                       <Link href={`/dashboard/cases/${r.id}`} key={i} className="block group">
                          <div className="flex items-center gap-4 p-4 rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--brand-dim)] transition-all">
                             <img src={r.photo} className="w-[48px] h-[48px] rounded-full object-cover shadow-sm bg-[var(--bg-surface)]" alt="Match" />
                             
                             <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-[14px] text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">{r.name}</span>
                                  <span className={`text-[12px] font-bold ${r.confidence > 80 ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                                    {r.confidence}%
                                  </span>
                                </div>
                                
                                <div className="w-full h-[4px] bg-[var(--bg-surface)] rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${r.confidence > 80 ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'}`} 
                                    style={{ width: `${r.confidence}%` }}
                                  />
                                </div>
                             </div>
                          </div>
                       </Link>
                     ))}
                  </div>
               </div>
            ) : isScanning ? (
              <div className="w-full h-full flex flex-col items-center justify-center opacity-60">
                 <Hexagon className="w-12 h-12 text-[var(--brand)] animate-spin mb-4" />
                 <p className="text-[14px] font-medium text-[var(--text-secondary)]">Triangulating arrays...</p>
                 <div className="w-[200px] h-[2px] bg-[var(--bg-elevated)] mt-6 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--brand)] w-1/2 animate-[bounce_1s_infinite]" />
                 </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                 <Target className="w-12 h-12 text-[var(--text-muted)] mb-4" />
                 <p className="text-[14px] font-medium text-[var(--text-secondary)]">Awaiting visual parameter input.</p>
              </div>
            )}
         </div>

       </div>
       
       <style dangerouslySetInnerHTML={{__html: `
            @keyframes scanLine {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(200%); }
            }
            .animate-scan-line {
              animation: scanLine 2s linear infinite;
              height: 20%;
            }
          `}} />
    </div>
  );
}
