export type TradeStatusApi = 'CLOSED' | 'COMPLETE';
export type TradeSideApi = 'BUY' | 'SELL';

export interface TradeHistoryItemApi {
  id: string; // unique id
  orderRef: string; // order reference string
  side: TradeSideApi; // BUY | SELL
  symbol: string; // e.g., BTC
  baseSymbol?: string; // e.g., BTC (optional; fallback to symbol)
  quoteSymbol?: string; // e.g., USDT (optional; default USDT if missing)
  matchedAmount: number; // amount matched/filled
  price: number; // execution price
  currency?: string; // e.g., USD
  status: TradeStatusApi; // CLOSED | COMPLETE
  createdAt: string; // ISO string timestamp
}

export interface GetTradeHistoryRequest {
  page?: number;
  limit?: number;
  range?: 'all' | 'today' | 'month' | 'year';
}

export interface GetTradeHistoryResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: TradeHistoryItemApi[];
}

