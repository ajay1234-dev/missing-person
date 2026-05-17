export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "family";
}

export interface MissingPersonCase {
  id: string;
  name: string;
  age: number;
  gender: string;
  description: string;
  lastSeenLocation: string;
  lastSeenDate: string; // ISO string
  photoURL: string;
  faceDescriptor?: number[]; // Array of 128 floats for face-api matches
  status: "Active" | "Found" | "Closed";
  reportedBy: string; // User ID of family
  reportedAt: string; // ISO string
  contactNumber: string;
}

export interface ScanResult {
  id: string;
  scannedAt: string; // ISO string
  imageURL: string;
  scannedBy: string; // User ID
  matches: Array<{
    missingPersonId: string;
    confidence: number;
  }>;
}

export interface Alert {
  id: string;
  missingPersonId: string;
  matchedImageURL: string;
  location: string;
  confidence: number;
  status: "pending" | "verified" | "false_alarm";
  createdAt: string; // ISO string
}

export interface Tip {
  id: string;
  missingPersonId: string;
  location: string;
  dateSeen: string; // ISO string
  photoURL?: string;
  createdAt: string; // ISO string
  status: "new" | "reviewed";
}
