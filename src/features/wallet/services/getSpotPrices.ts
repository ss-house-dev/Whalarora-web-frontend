import { axiosNext } from '@/lib/axios';
export async function getSpotPrices(symbols: string[]): Promise<Record<string, number>> {
  if (!symbols?.length) return {};
  const { data } = await axiosNext.get<Record<string, number>>('/price/binance', {
    params: { symbols: symbols.join(',') },
  });
  return data;
}
