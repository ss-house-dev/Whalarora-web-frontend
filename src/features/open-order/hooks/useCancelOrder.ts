import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import cancelOrder, {
  CancelOrderRequest,
  CancelOrderResponse,
} from '@/features/open-order/services/cancelOrder';
import { TradeQueryKeys as OpenOrderQueryKeys } from '@/features/open-order/constants';
import { TradeQueryKeys as WalletTradeQueryKeys } from '@/features/trading/constants';
import { TradeQueryKeys as AssetsQueryKeys } from '@/features/assets/constants';

export const useCancelOrder = (
  options?: UseMutationOptions<CancelOrderResponse, Error, CancelOrderRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (data, variables, context) => {
      // Refresh open orders
      queryClient.invalidateQueries({ queryKey: [OpenOrderQueryKeys.GET_OPEN_ORDERS] });

      // Refresh wallet cash balance (กรณี BUY refund)
      queryClient.invalidateQueries({ queryKey: [WalletTradeQueryKeys.GET_CASH_BALANCE] });

      // Refresh assets (กรณี SELL return remaining assets)
      queryClient.invalidateQueries({ queryKey: [AssetsQueryKeys.GET_ALL_ASSETS] });

      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};
