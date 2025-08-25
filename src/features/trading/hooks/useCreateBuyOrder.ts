import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import createBuyOrder, { CreateBuyOrderRequest, CreateBuyOrderResponse } from "@/features/trading/services/createBuyOrder";
import { TradeQueryKeys } from "@/features/trading/constants";

export const useCreateBuyOrder = (
  options?: UseMutationOptions<CreateBuyOrderResponse, Error, CreateBuyOrderRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBuyOrder,
    onSuccess: (data, variables, context) => {
      console.log("Buy order created successfully:", data);

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [TradeQueryKeys.GET_CASH_BALANCE],
      });

      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error("Error creating buy order:", error);

      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};