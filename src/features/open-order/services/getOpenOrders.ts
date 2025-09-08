import axiosInstance from '@/lib/axios';
import { GetOpenOrdersRequest, GetOpenOrdersResponse } from '../types';

const getOpenOrders = async (params: GetOpenOrdersRequest = {}): Promise<GetOpenOrdersResponse> => {
  try {
    const { data } = await axiosInstance.get('/trade/open', {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
      },
    });

    return data;
  } catch (error: unknown) {
    console.error('Get open orders error:', error);

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

      if (axiosError.response?.status === 403) {
        throw new Error('Access denied. Insufficient permissions');
      }

      if (axiosError.response?.status === 404) {
        throw new Error('Orders not found');
      }

      const errorMessage =
        axiosError.response?.data?.message || 'An error occurred while fetching open orders.';
      throw new Error(errorMessage);
    }

    // กรณี error ที่ไม่ใช่ axios error
    throw new Error('An unexpected error occurred while fetching open orders.');
  }
};

export default getOpenOrders;
export type { GetOpenOrdersRequest, GetOpenOrdersResponse };