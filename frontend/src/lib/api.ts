import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
}

export interface TableSchema {
  table_name: string;
  columns: TableColumn[];
  foreign_keys: Array<Record<string, unknown>>;
}

export interface SchemaResponse {
  schema: TableSchema[];
}

export interface ChartConfig {
  type: string;
  x_axis: string;
  y_axis: string;
}

export interface QueryResponse {
  sql: string;
  explanation: string;
  data: Array<Record<string, unknown>> | string;
  chart_config: ChartConfig;
}

export const fetchSchema = async (): Promise<SchemaResponse> => {
  const response = await api.get('/database/schema');
  return response.data;
};

export const generateQuery = async (query: string): Promise<QueryResponse> => {
  const response = await api.post('/query/generate', { query });
  return response.data;
};

export interface DatabaseItem {
  id: number;
  name: string;
  type: string;
  description: string;
  status: "connected" | "syncing" | "error";
  last_queried_at: string | null;
}

export const fetchDatabases = async (): Promise<DatabaseItem[]> => {
  const response = await api.get('/databases');
  return response.data;
};

export default api;
