export const TradeQueryKeys = {
  GET_COIN_ASSET: 'getCoinAsset',
  GET_OPEN_ORDERS: 'getOpenOrders',
  GET_ORDER_HISTORY: 'getOrderHistory',
  CANCEL_ORDER: 'cancelOrder',
} as const;

export const ORDER_SIDES = {
  BUY: 'BUY',
  SELL: 'SELL',
} as const;

export const ORDER_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
  PARTIALLY_FILLED: 'PARTIALLY_FILLED',
} as const;

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
} as const;

export const REFETCH_INTERVALS = {
  OPEN_ORDERS: 5000, // 5 seconds
  FAST: 1000,
  MEDIUM: 5000,
  SLOW: 10000,
} as const;