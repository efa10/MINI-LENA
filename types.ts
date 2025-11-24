export interface KeyMetric {
  label: string;
  value: string;
  trend: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface ChartDataPoint {
  name: string;
  revenue: number;
  profit: number;
  expenses: number;
}

export interface AnalysisResult {
  executiveSummary: string;
  keyMetrics: KeyMetric[];
  chartData: ChartDataPoint[];
}

export interface UploadedFile {
  data: string; // Base64 string
  mimeType: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  DASHBOARD = 'DASHBOARD',
  ERROR = 'ERROR'
}