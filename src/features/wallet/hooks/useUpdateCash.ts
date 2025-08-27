import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { TradeQueryKeys } from "@/features/wallet/constants";
import resetPortfolio, {
  ResetPortfolioResponse,
} from "@/features/wallet/services/updateCash";

export const useResetPortfolio = (
  options?: Partial<UseMutationOptions<ResetPortfolioResponse, Error, void>>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetPortfolio,
    onSuccess: (data, variables, context) => {
      console.log("Wallet reset successfully");

      queryClient.invalidateQueries({
        queryKey: [TradeQueryKeys.GET_CASH_BALANCE],
      });

      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error("Error reset cash:", error);

      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};
