// src/features/wallet/services/buildHoldingRows.ts
import type { ApiAsset, HoldingRow } from '../types';

const SYMBOL_NAME: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  ADA: 'Cardano',
  BNB: 'Binance Coin',
  DOGE: 'Dogecoin',
  CASH: 'Cash',
};

// Fallback ถ้าราคา live ยังไม่มา
const PRICE_MAP: Partial<Record<string, number>> = {
  BTC: 115200,
  ETH: 4000,
  ADA: 0.5,
  BNB: 600,
  DOGE: 0.1,
  CASH: 1,
};

export function buildHoldingRows(
  api: ApiAsset[],
  live: Partial<Record<string, number>> = {} //  <-- เพิ่มพารามิเตอร์ที่ 2 (optional)
): HoldingRow[] {
  return api
    .filter((a) => a.symbol !== 'CASH')
    .map((a) => {
      const symbol = a.symbol;
      const amount = a.amount ?? 0;

      const currentPrice = live[symbol] ?? PRICE_MAP[symbol] ?? 0;
      const averageCost = a.avgPrice ?? 0;

      const value = amount * currentPrice;
      const pnlAbs = (currentPrice - averageCost) * amount;
      const pnlPct = averageCost > 0 ? currentPrice / averageCost - 1 : 0;

      return {
        id: a._id,
        symbol,
        name: SYMBOL_NAME[symbol] ?? symbol,
        amount,
        currentPrice,
        averageCost,
        value,
        pnlAbs,
        pnlPct,
      };
    });
}
