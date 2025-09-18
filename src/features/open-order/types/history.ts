export type TradeHistoryRange = 'all' | 'day' | 'month' | 'year';

export type TradeHistoryStatusApi = 'MATCHED' | 'CANCELLED' | 'COMPLETE' | 'CLOSED';
export type TradeSideApi = 'BUY' | 'SELL';

export interface TradeHistoryItemApi {
  _id: string;
  tradeRef: string;
  symbol: string;
  side: TradeSideApi;
  status: TradeHistoryStatusApi | string;
  price?: number;
  amount?: number;
  matchedAmountTotal?: number;
  currency?: string;
  baseSymbol?: string;
  quoteSymbol?: string;
  buyOrderRef?: string;
  sellOrderRef?: string;
  matchedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetTradeHistoryResponseApi {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  range: TradeHistoryRange;
  histories: TradeHistoryItemApi[];
}

export interface TradeHistoryItem {
  id: string;
  tradeRef: string;
  symbol: string;
  side: TradeSideApi;
  status: TradeHistoryStatusApi | string;
  amount: number;
  price: number;
  currency: string;
  baseSymbol: string;
  buyOrderRef?: string;
  sellOrderRef?: string;
  quoteSymbol: string;
  matchedAt?: string;
  createdAt?: string;
}

export interface GetTradeHistoryRequest {
  page?: number;
  limit?: number;
  range?: TradeHistoryRange;
}

export interface GetTradeHistoryResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  range: TradeHistoryRange;
  items: TradeHistoryItem[];
}
