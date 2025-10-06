import axiosInstance from '@/lib/axios';

export interface Volume24hResponse {
  symbol: string;
  windowStart: string;
  windowEnd: string;
  tradeCount: number;
  volumeAmount: number;
  volumeUSDT: number;
}

const getVolume24h = async (symbol: string): Promise<Volume24hResponse> => {
  const trimmedSymbol = symbol.trim();

  if (!trimmedSymbol) {
    throw new Error('Symbol is required to fetch 24h volume.');
  }

  try {
    const { data } = await axiosInstance.get<Volume24hResponse>('/trade/volume-24h', {
      params: { symbol: trimmedSymbol },
    });

    return data;
  } catch (error: unknown) {
    console.error('Get 24-hour volume error:', error);

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
        throw new Error('Please log in again.');
      }

      if (axiosError.response?.status === 404) {
        throw new Error('24h volume data not found.');
      }

      const errorMessage =
        axiosError.response?.data?.message || 'An error occurred while fetching 24h volume.';

      throw new Error(errorMessage);
    }

    throw new Error('An unexpected error occurred while fetching 24h volume.');
  }
};

export default getVolume24h;
