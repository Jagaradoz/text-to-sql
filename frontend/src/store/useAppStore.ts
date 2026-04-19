import { create } from 'zustand';
import { fetchDatabaseOverview, generate } from '@/lib/api';
import { AppState } from '@/types/store';
import { GenerateParams } from '@/types/api';

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}

export const useAppStore = create<AppState>((set, get) => ({
  databases: [],
  activeResult: null,
  isLoading: false,
  error: null,
  apiKey: '',

  resetError: () => set({ error: null }),
  setApiKey: (key: string) => set({ apiKey: key }),

  getDatabases: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchDatabaseOverview();
      set({ databases: data.databases, isLoading: false });
    } catch (err: unknown) {
      console.warn('Could not fetch databases:', getErrorMessage(err, 'Unknown error'));
      set({ databases: [], isLoading: false });
    }
  },

  submitGenerate: async (params: GenerateParams) => {
    set({ isLoading: true, error: null });
    try {
      const data = await generate(params, get().apiKey || undefined);
      set({ activeResult: data, isLoading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to generate'), isLoading: false });
    }
  },
}));

