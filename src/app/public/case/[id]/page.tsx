import { mockCases } from "@/lib/mocks/data"; 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Info } from "lucide-react";
import { Metadata } from 'next';
import { PublicTipForm } from "@/components/shared/PublicTipForm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const person = mockCases.find(p => p.id === resolvedParams.id);
  
  if (!person) return { title: 'Case Not Found' };
  
  return {
    title: `MISSING: ${person.name} | FindSystem AI`,
    description: `Have you seen ${person.name}? Last seen at ${person.lastSeenLocation}. Contact authorities immediately.`,
    openGraph: {
      title: `URGENT ALERT: Missing Person - ${person.name}`,
      description: person.description,
      images: [person.photoURL]
    }
  }
}

export default async function PublicCasePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const person = mockCases.find(p => p.id === resolvedParams.id);

  if (!person) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">Case not found or has been closed.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-sky-200">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="bg-sky-600 p-1.5 rounded-md"><Info className="text-white w-5 h-5"/></div>
             <span className="font-bold text-lg text-slate-900 dark:text-white">Official Missing Person Notice</span>
           </div>
           <Button variant="outline" size="sm" asChild>
             <a href="tel:911">Call Emergency (911)</a>
           </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row">
           <div className="md:w-1/3 bg-slate-100 dark:bg-slate-950 relative">
             <img src={person.photoURL} alt={person.name} className="w-full h-full object-cover min-h-[300px]" />
             {person.status !== "Active" && (
                <div className="absolute inset-0 bg-green-900/60 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-3xl tracking-widest uppercase border-4 border-white px-6 py-2 rounded-lg rotate-12 bg-green-500/20">FOUND</span>
                </div>
             )}
           </div>
           <div className="p-6 md:p-8 md:w-2/3 space-y-4">
             <div className="flex flex-wrap items-center gap-3">
               <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{person.name}</h1>
               <Badge className="bg-red-500 text-sm py-1">MISSING</Badge>
             </div>
             
             <p className="text-lg text-slate-600 dark:text-slate-300">
               {person.age} years old • {person.gender}
             </p>
             
             <div className="prose dark:prose-invert">
               <p>{person.description}</p>
             </div>

             <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                   <MapPin className="text-sky-600 w-5 h-5 shrink-0" />
                   <div>
                     <p className="font-semibold text-sm">Last Seen Location</p>
                     <p className="text-slate-500 text-sm">{person.lastSeenLocation}</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <Calendar className="text-sky-600 w-5 h-5 shrink-0" />
                   <div>
                     <p className="font-semibold text-sm">Date Last Seen</p>
                     <p className="text-slate-500 text-sm">{new Date(person.lastSeenDate).toLocaleDateString()}</p>
                   </div>
                </div>
             </div>
           </div>
        </div>

        {person.status === "Active" && <PublicTipForm />}
      </main>
    </div>
  );
}
