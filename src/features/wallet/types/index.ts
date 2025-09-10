export type AddCashPayload = void;

export interface AddCashResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId?: string;
    amount: number;
    balance?: number;
  };
}

export type ApiAsset = {
  _id: string;
  userId: string;
  symbol: string;
  amount: number;
  avgPrice: number;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type HoldingRow = {
  id: string | number;
  symbol: string;
  name: string;
  amount: number;
  currentPrice: number;
  averageCost: number;
  value: number;
  pnlAbs: number;
  pnlPct: number; // 0.02 = +2%
};
