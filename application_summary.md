# Findra AI: Application Architecture & Summary

**Findra AI** is a state-of-the-art Next.js web application engineered to operate as a centralized intelligence system for tracking, detecting, and recovering missing persons. It bridges the gap between law enforcement, NGOs, and victims' families by combining a robust database structure with simulated real-time CCTV facial-recognition processing.

---

## 1. What Can It Do? (Core Features)

### Role-Based Operations Center
The app assigns security layers based on user tokens (`Admin`, `NGO`, `Family`). Families can only view basic data and report cases, while Admins govern the global workflow (such as confirming visual matches and locking cases down).

### Threat & Case Injection (`/dashboard/report`)
Users can inject high-fidelity parameters—including 34-point profiles (Age, Temporal Stamps, Modifiers) alongside a reference portrait. When submitted, the system mathematically maps this case into a global active vector matrix (the database).

### CCTV Origin Scanner (`/dashboard/scan`)
Admins and NGOs can manually drag and drop imagery obtained from traffic cameras or localized CCTV systems. The engine cross-references this visual data against the database by simulating a 128-dimensional Euclidean distance check. If a facial vector is matched with >80% confidence, a silent system alert is automatically broadcasted.

### Live Network Surveillance (`/dashboard/live`)
A tactical command center simulating an asynchronous connection to active visual nodes globally. When toggled online, it continuously streams mock inference data, simulating real-world scenarios where active cases happen to walk past mapped transit nodes.

### Visual Verification & Alert Cascades (`/dashboard/alerts`)
When an automatic or manual scan trips the confidence threshold, a "Pending Alert" arrives directly in front of an Admin. Upon clicking **Confirm Target**, a cascade effect occurs:
- The alert moves to the historically permanent "Verified" bin.
- The global database zeroes in on the exact missing person matched.
- The system alters their global status flag to **Found**, instantaneously notifying active tracking nodes safely.

### Live Telemetry Dashboard (`/dashboard/analytics`)
Data doesn't sleep. The headquarters overview binds directly to a live WebSocket-like stream (Firebase `onSnapshot`), displaying YTD Case Velocity charts mapped backward over a rolling 6-month timescale, tracking Active cases versus recovered metrics continuously in real-time.

---

## 2. Technology Stack & Routing Map

This is a heavily modernized Front-End architecture utilizing a completely Serverless Cloud backend backbone.

| Technology | Implementation & Reasoning |
| :--- | :--- |
| **Next.js (App Router)** | The core backbone routing framework. We utilize Next.js layout structures, `(app)` paradigms, and Server-Side Rendering capabilities (like your Metadata tags) paired extensively with `'use client'` interactive trees. |
| **React Hooks (Client)** | Complex logical engines like `useEffect`, `useState`, and `useMemo` handle the sorting algorithms on the fly (e.g. bucketing thousands of cases into chronological months without blocking the browser thread). |
| **Firebase Firestore** | Your NoSQL cloud database. It stores `users`, `alerts`, and `missingPersons`. The brilliance here comes from **`onSnapshot`**, a listener that allows the dashboard cards, charts, and alerts to dynamically change the micro-second a document updates globally, avoiding page-refreshes completely. |
| **Firebase Auth** | Managing identity. Authenticated keys map directly to Firebase user roles, establishing security boundaries between generic users and authorized administrative investigators. |
| **Zustand (`useAppStore`)** | The global state manager. It handles knowing *who* is logged in and broadcasts that to every component in the DOM invisibly (preventing ugly prop-drilling). |
| **Tailwind CSS & CSS Var Theme** | Advanced UI rendering leveraging utility classes. Notice the beautiful glassmorphism gradients, pulse pings for live nodes, and the dark/neon aesthetic driven purely through Tailwind utility binding. |
| **Zod & React Hook Form** | The defensive wall surrounding `/dashboard/report`. Instead of crashing if someone inputs "five" into an age field, Zod mathematically coerces the strings into precise types prior to submitting them dynamically through React Hook Form registers. |
| **Recharts / SVG** | Powers the dynamic visual YTD bar-charts and is entirely dynamic, computing data off timestamps mapped exactly to native browser SVG elements. |

## 3. The Operational Data Cycle

1. **Ingest**: A family logs onto Findra AI. They bypass auth and upload an image and bio using Zod pipelines. This lands in Firestore (`missingPersons`).
2. **Scan/Wait**: The Database holds the case open as "Active". Somewhere in the server structure, a CCTV frame (manual or Live module) tests an image similarity algorithm.
3. **Fire**: An image intersects! A separate `alerts` document drops into Firestore marking mapping data, but held under a strict "Pending Review" sequence to prevent mass-panic fake alarms. 
4. **Resolution**: An Admin verifies it in `/alerts`. The system updates both the database instances synchronously, shifting metrics dynamically into the "Recovered" bucket via Recharts/Tailwind overlays instantly.
