export interface AddCashPayload {
  // API ไม่ต้องการ parameters ใดๆ จะเพิ่มเงิน 10,000 อัตโนมัติ
}

export interface AddCashResponse {
  success: boolean
  message: string
  data?: {
    transactionId?: string
    amount: number
    balance?: number
  }
}