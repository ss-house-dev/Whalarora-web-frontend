import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import createSellOrder, {
  CreateSellOrderRequest,
  CreateSellOrderResponse,
} from '@/features/trading/services/createSellOrder';
import { TradeQueryKeys as WalletTradeQueryKeys } from '@/features/trading/constants';

export const useCreateSellOrder = (
  options?: UseMutationOptions<CreateSellOrderResponse, Error, CreateSellOrderRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSellOrder,
    onSuccess: (data, variables, context) => {
      console.log('Sell order created successfully:', data);

      // Invalidate cash balance queries to refresh wallet amount
      queryClient.invalidateQueries({
        queryKey: [WalletTradeQueryKeys.GET_CASH_BALANCE],
      });

      // Force refetch cash balance immediately
      queryClient.refetchQueries({
        queryKey: [WalletTradeQueryKeys.GET_CASH_BALANCE],
      });

      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error('Error creating sell order:', error);

      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};
