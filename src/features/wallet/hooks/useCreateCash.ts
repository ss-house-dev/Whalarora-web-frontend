import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { addCashToTrade, AddCashResponse } from '@/features/wallet/services';
import { TradeQueryKeys } from '@/features/wallet/constants';

export const useAddCashToTrade = (options?: UseMutationOptions<AddCashResponse, Error, void>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCashToTrade,
    onSuccess: (data, variables, context) => {
      console.log('Cash added successfully:', data);

      queryClient.invalidateQueries({
        queryKey: [TradeQueryKeys.GET_CASH_BALANCE],
      });

      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error('Error adding cash:', error);

      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};
