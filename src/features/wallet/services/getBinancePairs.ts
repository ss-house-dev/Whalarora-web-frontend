import { axiosNext } from "@/lib/axios";

export async function getBinancePairs(): Promise<Record<string, string>> {
  const { data } = await axiosNext.get<Record<string, string>>("/price/binance/symbols");
  return data;
}
