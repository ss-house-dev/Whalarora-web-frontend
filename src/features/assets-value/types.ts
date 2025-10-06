export type AssetValuation = {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  averageCost: number;
  price: number;
  value: number;
  cost: number;
  pnlValue: number;
  pnlPercent: number;
  iconUrl: string;
};

export type AllocationSlice = {
  id: string;
  symbol: string;
  name?: string;
  value: number;
  cost: number;
  percentage: number;
  pnlValue: number;
  pnlPercent: number;
  iconUrl?: string;
  color: string;
  otherHoldings?: Array<{
    id: string;
    symbol: string;
    value: number;
    amount: number;
    averageCost: number;
    cost: number;
    pnlValue: number;
  }>;
  isOther?: boolean;
};
