// import { UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query'
// import { TradeQueryKeys } from '../constants/TradeQueryKeys'
// import getCash from '../services/getCash'

// interface CashResponse {
//   userId: string;
//   symbol: string;
//   amount: number;
// }

// // สำหรับการ reset balance - ใช้ getCash เพื่อดึงข้อมูลปัจจุบัน
// // หรือถ้ามี API สำหรับ reset โดยเฉพาะ ให้สร้าง service ใหม่
// export const useResetCash = (
//   token: string,
//   options?: Partial<UseMutationOptions<CashResponse, Error, void>>
// ) => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: () => getCash(token), // ใช้ getCash เพื่อ refresh ข้อมูล
//     onSuccess: (data) => {
//       // Invalidate และ refetch ข้อมูล balance
//       queryClient.invalidateQueries({ queryKey: [TradeQueryKeys.GET_CASH] })
//       options?.onSuccess?.(data, undefined, {} as any)
//     },
//     ...options,
//   })
// }