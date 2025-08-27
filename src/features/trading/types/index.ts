export interface CreateBuyOrderRequest {
  userId: string;
  symbol: string;
  price: number;
  amount: number;
  lotPrice?: number;
  confirm?: boolean;
  onInsufficient?: "CANCEL" | "KEEP_OPEN";
  keepOpen?: boolean;
}

export interface CreateBuyOrderResponse {
  // Success response (when order is executed)
  orderRef: string;
  filled?: number;
  remaining?: number;
  spent?: number;
  refund?: number;
  message?: string;

  // Confirmation required response (when insufficient funds)
  requiresConfirmation?: boolean;
  filledPreview?: number;
  spendPreview?: number;
  remainingPreview?: number;
  options?: ("CANCEL" | "KEEP_OPEN")[];
}
