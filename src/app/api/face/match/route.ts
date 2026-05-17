import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { descriptor } = body; 
    
    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json({ error: "Missing or invalid face descriptor 128-dim array" }, { status: 400 });
    }

    // Fetch active cases from real Firestore collection
    const q = query(collection(db, "missingPersons"), where("status", "==", "Active"));
    const snapshot = await getDocs(q);
    
    // We cannot import faceMatch.ts client libs directly onto Edge/Node without tfjs-node
    // So we run the basic Euclidean math manually here for simple array distance
    const calculateEuclideanDistance = (desc1: number[], desc2: number[]) => {
      let sum = 0;
      for (let i = 0; i < desc1.length; i++) {
        const diff = desc1[i] - desc2[i];
        sum += diff * diff;
      }
      return Math.sqrt(sum);
    };

    const distanceToConfidence = (distance: number) => {
      const MAX_THRESHOLD = 0.9;
      if (distance > MAX_THRESHOLD) return 0;
      const calc = (1 - (distance / MAX_THRESHOLD)) * 100;
      return Math.min(100, Math.max(0, Math.round(calc)));
    };

    // normally we filter for `c.data().faceDescriptor` existing, but since some docs might not have it yet
    const allDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    
    const matches = allDocs
      .filter(c => c.faceDescriptor && Array.isArray(c.faceDescriptor))
      .map(c => {
        const distance = calculateEuclideanDistance(descriptor, c.faceDescriptor);
        const confidence = distanceToConfidence(distance);
        
        return {
          missingPersonId: c.id,
          name: c.name,
          confidence,
          photoURL: c.photoURL,
          lastSeenLocation: c.lastSeenLocation,
        };
      })
      .filter(m => m.confidence >= 70) // Filter only above 70% per requirements
      .sort((a, b) => b.confidence - a.confidence);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Match API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
