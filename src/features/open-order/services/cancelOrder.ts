import axiosInstance from '@/lib/axios';

export interface CancelOrderRequest {
  orderRef: string;
  side: 'BUY' | 'SELL';
}

// Define a minimal type and allow extra fields.
export interface CancelOrderResponse {
  message?: string;
  [key: string]: unknown;
}

const cancelOrder = async (body: CancelOrderRequest): Promise<CancelOrderResponse> => {
  try {
    const { data } = await axiosInstance.post('/trade/cancel', body);
    return data as CancelOrderResponse;
  } catch (error: unknown) {
    console.error('Cancel order error:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: { message?: string };
        };
      };

      if (axiosError.response?.status === 401) {
        throw new Error('Please log in again');
      }

      const errorMessage =
        axiosError.response?.data?.message || 'An error occurred while cancelling the order.';
      throw new Error(errorMessage);
    }

    throw new Error('An unexpected error occurred while cancelling the order.');
  }
};

export default cancelOrder;
