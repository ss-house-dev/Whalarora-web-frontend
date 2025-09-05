import axiosInstance from '@/lib/axios';
import { GetCoinRequest, GetCoinResponse } from '../types';

const getCoin = async (params: GetCoinRequest): Promise<GetCoinResponse> => {
  try {
    const { data } = await axiosInstance.get('/trade/asset', {
      params: {
        symbol: params.symbol,
      },
    });

    return data;
  } catch (error: unknown) {
    console.error('Get coin asset error:', error);

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

      if (axiosError.response?.status === 404) {
        throw new Error('Asset not found');
      }

      const errorMessage =
        axiosError.response?.data?.message || 'An error occurred while fetching coin asset.';
      throw new Error(errorMessage);
    }

    // กรณี error ที่ไม่ใช่ axios error
    throw new Error('An unexpected error occurred while fetching coin asset.');
  }
};

export default getCoin;
export type { GetCoinRequest, GetCoinResponse };
