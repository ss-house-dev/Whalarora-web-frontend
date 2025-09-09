export interface OpenOrder {
  _id: string;
  orderRef: string;
  userId: string;
  side: 'BUY' | 'SELL';
  symbol: string;
  price: number;
  amount: number;
  totalLotPrice: number;
  originalAmount: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED' | 'PARTIALLY_FILLED';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetOpenOrdersRequest {
  page?: number;
  limit?: number;
}

export interface GetOpenOrdersResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  formattedOrders: OpenOrder[];
}

export interface OpenOrdersState {
  orders: OpenOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
}
