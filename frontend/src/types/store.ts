import { DatabaseOverviewItem, GenerateResponse, GenerateParams } from "./api";

export interface AppState {
  databases: DatabaseOverviewItem[];
  activeResult: GenerateResponse | null;
  isLoading: boolean;
  error: string | null;
  apiKey: string;

  // Actions
  getDatabases: () => Promise<void>;
  submitGenerate: (params: GenerateParams) => Promise<void>;
  setApiKey: (key: string) => void;
  resetError: () => void;
}
