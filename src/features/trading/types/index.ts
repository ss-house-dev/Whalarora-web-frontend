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

// เพิ่มใน types.ts หรือไฟล์ types ที่เหมาะสม

export interface CreateSellOrderRequest {
  userId: string;
  symbol: string;
  price: number;
  amount: number;
}

export interface CreateSellOrderResponse {
  orderRef: string;
}