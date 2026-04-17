import { create } from 'zustand';
import { TableSchema, HistoryItem, QueryResponse, fetchSchema, fetchHistory, generateQuery } from '@/lib/api';

interface AppState {
  schema: TableSchema[];
  history: HistoryItem[];
  activeQuery: QueryResponse | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getSchema: () => Promise<void>;
  getHistory: () => Promise<void>;
  submitQuery: (query: string) => Promise<void>;
  resetError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  schema: [],
  history: [],
  activeQuery: null,
  isLoading: false,
  error: null,

  resetError: () => set({ error: null }),

  getSchema: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchSchema();
      set({ schema: data.schema, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch schema', isLoading: false });
    }
  },

  getHistory: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchHistory();
      set({ history: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch history', isLoading: false });
    }
  },

  submitQuery: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await generateQuery(query);
      set({ activeQuery: data, isLoading: false });
      // Refresh history after a new query
      const history = await fetchHistory();
      set({ history });
    } catch (err: any) {
      set({ error: err.message || 'Failed to generate query', isLoading: false });
    }
  },
}));
