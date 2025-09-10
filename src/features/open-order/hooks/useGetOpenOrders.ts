import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import getOpenOrders, { GetOpenOrdersResponse } from '@/features/open-order/services/getOpenOrders';
import { TradeQueryKeys, REFETCH_INTERVALS } from '@/features/open-order/constants';

interface UseGetOpenOrdersOptions
  extends Omit<UseQueryOptions<GetOpenOrdersResponse, Error>, 'queryKey' | 'queryFn'> {
  page?: number;
  limit?: number;
  autoRefresh?: boolean;
}

export const useGetOpenOrders = ({
  page = 1,
  limit = 10,
  autoRefresh = true,
  ...options
}: UseGetOpenOrdersOptions = {}) => {
  return useQuery({
    queryKey: [TradeQueryKeys.GET_OPEN_ORDERS, { page, limit }],
    queryFn: () => getOpenOrders({ page, limit }),
    enabled: options.enabled !== false,
    staleTime: 1000, // ข้อมูลเก่าหลังจาก 1 วินาที
    refetchInterval: autoRefresh ? REFETCH_INTERVALS.OPEN_ORDERS : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};
