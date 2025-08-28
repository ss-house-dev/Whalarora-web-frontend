import {
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import getCoin, { 
  GetCoinResponse 
} from "@/features/trading/services/getCoin";
import { TradeQueryKeys } from "@/features/trading/constants";

interface UseGetCoinOptions extends Omit<UseQueryOptions<GetCoinResponse, Error>, 'queryKey' | 'queryFn'> {
  symbol: string;
}

export const useGetCoin = ({ symbol, ...options }: UseGetCoinOptions) => {
  return useQuery({
    queryKey: [TradeQueryKeys.GET_COIN_ASSET, symbol],
    queryFn: () => getCoin({ symbol }),
    enabled: !!symbol && options.enabled !== false,
    staleTime: 10000,
    ...options,
  });
};