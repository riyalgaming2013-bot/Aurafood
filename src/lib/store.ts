import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AnalysisResult } from './gemini';

export interface ScanRecord {
  id: string;
  date: string;
  imageBlobUrl: string; // Storing blob URL for demo. In real app, we upload to storage.
  result: AnalysisResult;
}

interface AppState {
  scans: ScanRecord[];
  addScan: (scan: ScanRecord) => void;
  deleteScan: (id: string) => void;
  clearHistory: () => void;
  // Preferences
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      scans: [],
      addScan: (scan) => set((state) => ({ scans: [scan, ...state.scans] })),
      deleteScan: (id) => set((state) => ({ scans: state.scans.filter((s) => s.id !== id) })),
      clearHistory: () => set({ scans: [] }),
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'nutriscan-storage',
      partialize: (state) => ({ scans: state.scans, theme: state.theme }), // persist
    }
  )
);
