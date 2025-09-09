export interface Asset {
  _id: string;
  userId: string;
  symbol: string;
  amount: number;
  avgPrice: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetAllAssetsResponse extends Array<Asset> {}
