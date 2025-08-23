import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { addCashToTrade, AddCashResponse } from "@/features/wallet/services";

export const useAddCashToTrade = (
  options?: UseMutationOptions<AddCashResponse, Error, void>
) => {
  return useMutation({
    mutationFn: addCashToTrade,
    ...options,
  });
};
