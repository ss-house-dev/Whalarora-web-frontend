import axiosInstance from '@/lib/axios';
import { GetOpenOrdersRequest, GetOpenOrdersResponse } from '../types';

function buildEmptyResponse(params: GetOpenOrdersRequest = {}): GetOpenOrdersResponse {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    total: 0,
    totalPages: 1,
    formattedOrders: [],
  };
}

function extractStatus(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response;
    return response?.status;
  }
  return undefined;
}

function extractMessage(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message;
  }
  return undefined;
}

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
    const status = extractStatus(error);

    // For unauthenticated or forbidden users we gracefully return an empty list
    if (status === 401 || status === 403) {
      return buildEmptyResponse(params);
    }

    if (status === 404) {
      return buildEmptyResponse(params);
    }

    const message = extractMessage(error);
    if (message) {
      throw new Error(message);
    }

    throw new Error('An unexpected error occurred while fetching open orders.');
  }
};

export default getOpenOrders;
export type { GetOpenOrdersRequest, GetOpenOrdersResponse };
