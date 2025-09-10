import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import getAllAssets, { GetAllAssetsResponse } from '@/features/assets/services/getAllAssets';
import { TradeQueryKeys } from '@/features/assets/constants';

interface UseGetAllAssetsOptions
  extends Omit<UseQueryOptions<GetAllAssetsResponse, Error>, 'queryKey' | 'queryFn'> {}

export const useGetAllAssets = (options: UseGetAllAssetsOptions = {}) => {
  return useQuery({
    queryKey: [TradeQueryKeys.GET_ALL_ASSETS],
    queryFn: getAllAssets,
    staleTime: 30000, // 30 วินาที
    refetchInterval: 60000, // refetch ทุก 1 นาที
    ...options,
  });
};
