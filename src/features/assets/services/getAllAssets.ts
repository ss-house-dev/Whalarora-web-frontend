import axiosInstance from '@/lib/axios';
import { GetAllAssetsResponse } from '@/features/assets/types';

const getAllAssets = async (): Promise<GetAllAssetsResponse> => {
  try {
    const { data } = await axiosInstance.get('/trade/assets');
    return data;
  } catch (error: unknown) {
    console.error('Get all assets error:', error);

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
        throw new Error('Assets not found');
      }

      const errorMessage =
        axiosError.response?.data?.message || 'An error occurred while fetching assets.';
      throw new Error(errorMessage);
    }

    // กรณี error ที่ไม่ใช่ axios error
    throw new Error('An unexpected error occurred while fetching assets.');
  }
};

export default getAllAssets;
export type { GetAllAssetsResponse };
