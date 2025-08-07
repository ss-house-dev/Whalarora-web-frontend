// src/app/api/pairs/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.binance.com/api/v3/exchangeInfo');
    const data = await res.json();

    const usdtPairs = data.symbols
      .filter(
        (symbol: any) =>
          symbol.quoteAsset === 'USDT' && symbol.status === 'TRADING'
      )
      .map((symbol: any) => ({
        symbol: symbol.symbol,
        baseAsset: symbol.baseAsset,
        quoteAsset: symbol.quoteAsset,
      }));

    return NextResponse.json(usdtPairs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
