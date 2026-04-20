import { DatabaseOverviewItem, GenerateResponse, GenerateParams } from "./api";

export interface AppState {
  databases: DatabaseOverviewItem[];
  activeResult: GenerateResponse | null;
  isLoading: boolean;
  error: string | null;
  
  // Configuration
  apiKey: string;
  provider: "openai" | "google";
  activeModel: string;

  // Actions
  getDatabases: () => Promise<void>;
  submitGenerate: (params: GenerateParams) => Promise<void>;
  setApiKey: (key: string) => void;
  setProvider: (provider: "openai" | "google") => void;
  setActiveModel: (model: string) => void;
  resetError: () => void;
}
