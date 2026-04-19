import axios from 'axios';
import {
  DatabaseOverviewResponse,
  GenerateParams,
  GenerateResponse,
  TableRecordsResponse,
  UploadResponse
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Database Overview (GET /api/database/schema) ---

export const fetchDatabaseOverview = async (): Promise<DatabaseOverviewResponse> => {
  const response = await api.get('/database/schema');
  return response.data;
};

// --- Generate (POST /api/generate) ---

export const generate = async (params: GenerateParams, apiKey?: string): Promise<GenerateResponse> => {
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['x-ai-api-key'] = apiKey;
  }
  const response = await api.post('/generate', params, { headers });
  return response.data;
};

// --- Inspect Table (GET /api/database/{table_name}) ---

export const fetchTableRecords = async (tableName: string, page = 1, limit = 50): Promise<TableRecordsResponse> => {
  const response = await api.get(`/database/${tableName}`, { params: { page, limit } });
  return response.data;
};

// --- Upload (POST /api/database/upload) ---

export const uploadFile = async (file: File, apiKey?: string): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['x-ai-api-key'] = apiKey;
  }
  const response = await api.post('/database/upload', formData, {
    headers: { ...headers, 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// --- Health (GET /api/health) ---

export const healthCheck = async (): Promise<{ status: string; service: string }> => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
