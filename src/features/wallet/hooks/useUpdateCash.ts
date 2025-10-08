import { UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { TradeQueryKeys as WalletTradeQueryKeys } from '@/features/wallet/constants';
import { TradeQueryKeys as AssetTradeQueryKeys } from '@/features/assets/constants';
import { TradeQueryKeys as TradingTradeQueryKeys } from '@/features/trading/constants';
import resetPortfolio, { ResetPortfolioResponse } from '@/features/wallet/services/updateCash';
import type { GetAllAssetsResponse } from '@/features/assets/types';

export const useResetPortfolio = (
  options?: Partial<UseMutationOptions<ResetPortfolioResponse, Error, void>>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetPortfolio,
    onSuccess: (data, variables, context) => {
      console.log('Wallet reset successfully');

      queryClient.setQueryData<GetAllAssetsResponse>(
        [AssetTradeQueryKeys.GET_ALL_ASSETS],
        () => []
      );

      queryClient.invalidateQueries({
        queryKey: [WalletTradeQueryKeys.GET_CASH_BALANCE],
      });

      queryClient.invalidateQueries({
        queryKey: [AssetTradeQueryKeys.GET_ALL_ASSETS],
      });

      queryClient.invalidateQueries({
        queryKey: [TradingTradeQueryKeys.GET_COIN_ASSET],
      });

      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error('Error reset cash:', error);

      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};
