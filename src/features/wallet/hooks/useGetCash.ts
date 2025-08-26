import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { TradeQueryKeys } from "@/features/wallet/constants/TradeQueryKeys";
import getCashBalance, {
  CashBalance,
} from "@/features/wallet/services/getCash";

export const useGetCashBalance = <TData = CashBalance>(
  options?: Partial<
    UseQueryOptions<
      CashBalance,
      Error,
      TData,
      [TradeQueryKeys.GET_CASH_BALANCE]
    >
  >
) => {
  return useQuery({
    queryKey: [TradeQueryKeys.GET_CASH_BALANCE],
    queryFn: () => getCashBalance(),
    ...options,
  });
};
