export interface OrderFormData {
  amount: number;
  limitPrice: number;
  stopPrice: number;
  stopLimitPrice: number;
}

export interface OrderState {
  buyForm: OrderFormData;
  sellForm: OrderFormData;
  buyAttempted: boolean;
  sellAttempted: boolean;
  coinBalance: number;
}

export type OrderTab = "limit" | "market" | "stop";
export type OrderSide = "buy" | "sell";