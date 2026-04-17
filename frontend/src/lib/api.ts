import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
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
  foreign_keys: any[];
}

export interface SchemaResponse {
  schema: TableSchema[];
}

export interface QueryResponse {
  sql: string;
  explanation: string;
  data: any[];
  chart_config: {
    type: string;
    x_axis: string;
    y_axis: string;
  };
}

export interface HistoryItem {
  id: number;
  natural_language_query: string;
  generated_sql: string;
  explanation: string;
  execution_status: string;
  created_at: string;
}

export const fetchSchema = async (): Promise<SchemaResponse> => {
  const response = await api.get('/database/schema');
  return response.data;
};

export const fetchHistory = async (): Promise<HistoryItem[]> => {
  const response = await api.get('/history');
  return response.data;
};

export const generateQuery = async (query: string): Promise<QueryResponse> => {
  const response = await api.post('/query/generate', { query });
  return response.data;
};

export default api;
