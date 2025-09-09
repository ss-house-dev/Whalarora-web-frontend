import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const syms = (req.nextUrl.searchParams.get("symbols") || "")
    .split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
  if (!syms.length) return NextResponse.json({});
  const pairs = syms.map(s => `${s}USDT`);
  const url = `https://api.binance.com/api/v3/ticker/price?symbols=${encodeURIComponent(JSON.stringify(pairs))}`;
  const r = await fetch(url, { cache: "no-store" });
  const arr = await r.json() as Array<{symbol:string; price:string}>;
  const out: Record<string, number> = {};
  for (const x of arr) out[x.symbol.replace(/USDT$/i,"")] = Number(x.price);
  return NextResponse.json(out);
}
