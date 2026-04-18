import { create } from 'zustand';
import { TableSchema, GenerateResponse, DatabaseItem, fetchSchema, generate, fetchDatabases } from '@/lib/api';

interface AppState {
  schema: TableSchema[];
  databases: DatabaseItem[];
  activeResult: GenerateResponse | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getSchema: () => Promise<void>;
  getDatabases: () => Promise<void>;
  submitGenerate: (prompt: string) => Promise<void>;
  resetError: () => void;
}

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}

export const useAppStore = create<AppState>((set) => ({
  schema: [],
  databases: [],
  activeResult: null,
  isLoading: false,
  error: null,

  resetError: () => set({ error: null }),

  getSchema: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchSchema();
      set({ schema: data.schema, isLoading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to fetch schema'), isLoading: false });
    }
  },

  getDatabases: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchDatabases();
      set({ databases: data, isLoading: false });
    } catch (err: unknown) {
      // Gracefully handle missing endpoint — show empty list, not an error page
      console.warn('Could not fetch databases:', getErrorMessage(err, 'Unknown error'));
      set({ databases: [], isLoading: false });
    }
  },

  submitGenerate: async (prompt: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await generate(prompt);
      set({ activeResult: data, isLoading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to generate'), isLoading: false });
    }
  },
}));

