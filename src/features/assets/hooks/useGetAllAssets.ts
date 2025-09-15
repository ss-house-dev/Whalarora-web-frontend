import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import getAllAssets, { GetAllAssetsResponse } from '@/features/assets/services/getAllAssets';
import { TradeQueryKeys } from '@/features/assets/constants';

export const useGetAllAssets = (
  options: Omit<UseQueryOptions<GetAllAssetsResponse, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: [TradeQueryKeys.GET_ALL_ASSETS],
    queryFn: getAllAssets,
    staleTime: 30000, // 30 วินาที
    refetchInterval: 60000, // refetch ทุก 1 นาที
    ...options,
  });
};
