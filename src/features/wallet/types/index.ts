export type AddCashPayload = void;

export interface AddCashResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId?: string;
    amount: number;
    balance?: number;
  };
}
