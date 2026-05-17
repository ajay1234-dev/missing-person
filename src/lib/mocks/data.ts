import { MissingPersonCase, Alert } from "../../types";

export const mockCases: MissingPersonCase[] = [
  {
    id: "case_1",
    name: "John Doe",
    age: 34,
    gender: "Male",
    description: "Last seen wearing a blue jacket and jeans.",
    lastSeenLocation: "Downtown Seattle, WA",
    lastSeenDate: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    status: "Active",
    reportedBy: "family_user_1",
    reportedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    contactNumber: "+1-555-0192",
  },
  {
    id: "case_2",
    name: "Jane Smith",
    age: 28,
    gender: "Female",
    description: "May be confused. Has a birthmark on left cheek.",
    lastSeenLocation: "Portland, OR - Train Station",
    lastSeenDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    status: "Active",
    reportedBy: "family_user_2",
    reportedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    contactNumber: "+1-555-9831",
  }
];

export const mockAlerts: Alert[] = [
  {
    id: "alert_1",
    missingPersonId: "case_1",
    matchedImageURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80", // using same img for mock
    location: "Seattle Center CCTV-4",
    confidence: 94.2,
    status: "pending",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  }
];
