// import { UseQueryOptions, useQuery } from '@tanstack/react-query'
// import { TradeQueryKeys } from '../constants/TradeQueryKeys'
// import getCash from '../services/getCash'

// interface CashResponse {
//   userId: string;
//   symbol: string;
//   amount: number;
// }

// export const useGetCash = <TData = CashResponse>(
//   token: string,
//   options?: Partial<
//     UseQueryOptions<CashResponse, Error, TData, [TradeQueryKeys.GET_CASH]>
//   >,
// ) => {
//   return useQuery({
//     queryKey: [TradeQueryKeys.GET_CASH],
//     queryFn: () => getCash(token),
//     enabled: !!token, // เรียกใช้เมื่อมี token เท่านั้น
//     ...options,
//   })
// }