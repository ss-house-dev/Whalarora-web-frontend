import axiosInstance from '@/lib/axios';
import { CreateSellOrderRequest, CreateSellOrderResponse } from '../types';

const createSellOrder = async (
  orderData: CreateSellOrderRequest
): Promise<CreateSellOrderResponse> => {
  try {
    const { data } = await axiosInstance.post('/trade/sell', orderData);

    return data;
  } catch (error: unknown) {
    console.error('Create sell order error:', error);

    // Type guard เพื่อตรวจสอบ error structure
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            message?: string;
          };
        };
      };

      if (axiosError.response?.status === 401) {
        throw new Error('Please log in again');
      }

      const errorMessage =
        axiosError.response?.data?.message || 'An error occurred while creating sell order.';
      throw new Error(errorMessage);
    }

    // กรณี error ที่ไม่ใช่ axios error
    throw new Error('An unexpected error occurred while creating sell order.');
  }
};

export default createSellOrder;
export type { CreateSellOrderRequest, CreateSellOrderResponse };
