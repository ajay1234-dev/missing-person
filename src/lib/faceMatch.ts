import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function loadFaceModels() {
  if (modelsLoaded) return;
  try {
    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    modelsLoaded = true;
  } catch (error) {
    console.error("Failed to load face-api models", error);
    throw new Error("AI subsystem initialization failed.");
  }
}

export async function extractFaceDescriptor(imageElement: HTMLImageElement): Promise<Float32Array | null> {
  await loadFaceModels();
  
  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
    
  return detection ? detection.descriptor : null;
}

// Client-side helper calculate for exact Euclidean distance matching
export function calculateEuclideanDistance(desc1: number[] | Float32Array, desc2: number[] | Float32Array): number {
  if (desc1.length !== desc2.length) return Number.MAX_VALUE;
  
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// Helper to convert typical euclidean distances (0 to max) into a sensible Confidence Percentage (0-100)
export function distanceToConfidence(distance: number): number {
  // A perfect match is distance 0. Face-api considers < 0.6 an identical person.
  // We'll normalize so `0.6` distance maps roughly to 70% confidence.
  
  const MAX_THRESHOLD = 0.9;
  if (distance > MAX_THRESHOLD) return 0;
  
  // Transform scaling function bringing distance into linear percentage scale.
  // 0 dist = 100%, 0.6 dist = 70%, 1.0 dist = 0%
  const calc = (1 - (distance / MAX_THRESHOLD)) * 100;
  return Math.min(100, Math.max(0, Math.round(calc)));
}
