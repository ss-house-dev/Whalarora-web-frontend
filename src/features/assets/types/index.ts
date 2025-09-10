export interface Asset {
  _id: string;
  userId: string;
  symbol: string;
  amount: number;
  avgPrice: number;
  total: number;
  currentPrice?: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type GetAllAssetsResponse = Asset[];
