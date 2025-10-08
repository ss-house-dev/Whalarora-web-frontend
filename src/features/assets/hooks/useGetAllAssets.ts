import { useQuery, keepPreviousData, type UseQueryOptions } from '@tanstack/react-query';
import getAllAssets, { GetAllAssetsResponse } from '@/features/assets/services/getAllAssets';
import { TradeQueryKeys } from '@/features/assets/constants';

export const useGetAllAssets = (
  options: Omit<UseQueryOptions<GetAllAssetsResponse, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: [TradeQueryKeys.GET_ALL_ASSETS],
    queryFn: getAllAssets,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // refetch every minute
    refetchOnMount: 'always', // always fetch new data when the page mounts
    placeholderData: keepPreviousData,
    ...options,
  });
};
