export interface CreateBuyOrderRequest {
  userId: string;
  symbol: string;
  price: number;
  amount: number;
}
export interface CreateBuyOrderResponse {
  orderRef: string;
  filled: number;
  remaining: number;
  spent: number;
  refund: number;
  message: string;
}
export interface CreateSellOrderRequest {
  userId: string;
  symbol: string;
  price: number;
  amount: number;
  lotPrice: number;
}
export interface CreateSellOrderResponse {
  orderRef: string;
  filled: number;
  proceeds: number;
}
export interface GetCoinRequest {
  symbol: string;
}
export interface GetCoinResponse {
  userId: string;
  symbol: string;
  amount: number;
}
