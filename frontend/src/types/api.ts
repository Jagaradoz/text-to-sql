export interface DatabaseOverviewItem {
  name: string;
  description: string;
}

export interface DatabaseOverviewResponse {
  databases: DatabaseOverviewItem[];
}

export interface ChartConfig {
  type?: string;
  x_axis?: string;
  y_axis?: string;
}

export interface GenerateMeta {
  total_records: number;
  limit: number;
  page: number;
  total_pages: number;
  warning?: string | null;
}

export interface GenerateResponse {
  sql: string;
  explanation: string;
  data: Array<Record<string, unknown>> | string;
  chart_config: ChartConfig;
  meta: GenerateMeta;
}

export interface GenerateParams {
  prompt: string;
  provider?: string;
  model_name?: string;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
}

export interface TableRecordsResponse {
  table_name: string;
  meta: PaginationMeta;
  data: Array<Record<string, unknown>>;
}

export interface UploadResponse {
  status: string;
  message: string;
  metadata: Array<{ table_name: string; description: string }>;
}
