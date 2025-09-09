import { NextResponse } from "next/server";

type SymbolInfo = { symbol: string; status: string; baseAsset: string; quoteAsset: string };

export const revalidate = 6 * 60 * 60; // 6 ชั่วโมง (ISR)

export async function GET() {
  const r = await fetch("https://api.binance.com/api/v3/exchangeInfo", {
    cache: "force-cache",
    next: { revalidate },
  });
  const json = await r.json();
  const symbols: SymbolInfo[] = json?.symbols ?? [];

  const map: Record<string, string> = {};
  for (const s of symbols) {
    if (s.status === "TRADING" && s.quoteAsset === "USDT") {
      map[s.baseAsset] = s.symbol; // ex. BTC -> BTCUSDT
    }
  }
  return NextResponse.json(map);
}
