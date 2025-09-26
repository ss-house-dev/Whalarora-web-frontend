'use client';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type {
  GetTradeHistoryRequest,
  GetTradeHistoryResponse,
  GetTradeHistoryResponseApi,
  TradeHistoryItemApi,
} from '../types/history';

type Options = GetTradeHistoryRequest & {
  mock?: boolean; // use mocked data instead of calling API
  enabled?: boolean;
};

const DEFAULT_QUOTE_SYMBOL = 'USDT';
const DEFAULT_CURRENCY = 'USD';
const HISTORY_ENDPOINT = '/history';
const HISTORY_PROXY_ENDPOINT = '/api/history';

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

function buildEmptyResponse(params: GetTradeHistoryRequest): GetTradeHistoryResponse {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    total: 0,
    totalPages: 1,
    range: params.range ?? 'all',
    items: [],
  };
}

function mapHistoryItemApi(item: TradeHistoryItemApi): GetTradeHistoryResponse['items'][number] {
  const amount =
    typeof item.amount === 'number'
      ? item.amount
      : typeof item.matchedAmountTotal === 'number'
        ? item.matchedAmountTotal
        : 0;
  const baseSymbol = item.baseSymbol ?? item.symbol;
  const quoteSymbol = item.quoteSymbol ?? DEFAULT_QUOTE_SYMBOL;
  const currency = item.currency ?? DEFAULT_CURRENCY;

  return {
    id: item._id ?? item.tradeRef,
    tradeRef: item.tradeRef ?? item.buyOrderRef ?? item.sellOrderRef ?? item._id,
    symbol: baseSymbol,
    side: item.side,
    status: item.status,
    amount,
    price: typeof item.price === 'number' ? item.price : 0,
    currency,
    baseSymbol,
    quoteSymbol,
    buyOrderRef: item.buyOrderRef,
    sellOrderRef: item.sellOrderRef,
    matchedAt: item.matchedAt,
    createdAt: item.createdAt ?? item.matchedAt,
  };
}

function transformResponse(api: GetTradeHistoryResponseApi): GetTradeHistoryResponse {
  return {
    page: api.page,
    limit: api.limit,
    total: api.total,
    totalPages: api.totalPages,
    range: api.range,
    items: api.histories.map(mapHistoryItemApi),
  };
}

async function fetchTradeHistory(params: GetTradeHistoryRequest): Promise<GetTradeHistoryResponse> {
  const hasBaseUrl = Boolean(axiosInstance.defaults.baseURL);
  const url = hasBaseUrl ? HISTORY_ENDPOINT : HISTORY_PROXY_ENDPOINT;

  try {
    const { data } = await axiosInstance.get<GetTradeHistoryResponseApi>(url, { params });
    return transformResponse(data);
  } catch (error: unknown) {
    const status = extractStatus(error);

    if (status === 401 || status === 403 || status === 404) {
      return buildEmptyResponse(params);
    }

    const message = extractMessage(error);
    if (message) {
      throw new Error(message);
    }

    throw new Error('An unexpected error occurred while fetching trade history.');
  }
}

function buildMock(params: GetTradeHistoryRequest): GetTradeHistoryResponse {
  const iso = new Date().toISOString();
  const mockItems: TradeHistoryItemApi[] = [
    {
      _id: 'demo-1',
      tradeRef: '88cbe33fabcd0da4e39',
      side: 'BUY',
      status: 'CANCELLED',
      symbol: 'BTC',
      matchedAmountTotal: 0,
      matchedAt: iso,
      createdAt: iso,
    },
    {
      _id: 'demo-2',
      tradeRef: '11dbe33fabcd0da9a11',
      side: 'SELL',
      status: 'MATCHED',
      symbol: 'ETH',
      amount: 0.02,
      price: 115200,
      currency: 'USD',
      matchedAt: iso,
      createdAt: iso,
    },
  ];

  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    total: mockItems.length,
    totalPages: 1,
    range: params.range ?? 'all',
    items: mockItems.map(mapHistoryItemApi),
  };
}

export function useGetTradeHistory({ mock = false, enabled = true, ...params }: Options) {
  return useQuery({
    queryKey: ['trade-history', { ...params, mock }],
    enabled,
    queryFn: async () => (mock ? buildMock(params) : fetchTradeHistory(params)),
    staleTime: 5_000,
    placeholderData: keepPreviousData,
  });
}
