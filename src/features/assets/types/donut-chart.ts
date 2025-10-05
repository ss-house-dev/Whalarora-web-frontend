export interface Asset {
  id: string;
  name: string;
  amount: number;
  currentPrice: number;
  category?: string;
}

export interface DonutChartData {
  id: string;
  label: string;
  value: number;
  ratio: number;
  rank: number;
  color: string;
  members?: string[]; // For "Other" category
  [key: string]: any; // Add index signature for recharts
}

export interface DonutChartSummary {
  data: DonutChartData[];
  totalHoldingValue: number;
}
