import { create } from "zustand";
import { User } from "../types";
import { auth, db } from "../lib/firebase";
import { signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => Promise<void>;
  initializeAuthListener: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  logout: async () => {
    try {
      await firebaseSignOut(auth);
      // Remove the cookie used by middleware
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      set({ user: null });
      // Force navigation to home page to clear state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
  },

  initializeAuthListener: () => {
    // Check if we are in browser
    if (typeof window === 'undefined') return;

    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch role and extra data from firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            set({ 
              user: {
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: userData.name || firebaseUser.displayName || 'Unknown',
                role: userData.role || 'family',
              },
              isLoading: false 
            });
            // Set cookie for middleware
            const token = await firebaseUser.getIdToken();
            document.cookie = `auth-token=${token}; path=/`;
          } else {
             // Fallback if no user document (e.g., just signed up via OAuth and doc isn't written yet)
             set({ 
              user: {
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || 'Unknown',
                role: 'family',
              },
              isLoading: false 
            });
            const token = await firebaseUser.getIdToken();
            document.cookie = `auth-token=${token}; path=/`;
          }
        } catch(e) {
          console.error("Error fetching user role", e);
          set({ isLoading: false });
        }
      } else {
        set({ user: null, isLoading: false });
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    });
  }
}));
