"use client";

import { useState } from "react";
import { useBalance } from "@/components/contexts/BalanceContext";
import { useCryptoPrice } from '@/hooks/useCryptoPrice'

export default function OrderBox({ mainSymbol = "BTC" }: { mainSymbol?: string }) {
  const [tab, setTab] = useState<"limit" | "market" | "stop">("limit");
  const [buyAmount, setBuyAmount] = useState(1);
  const [sellAmount, setSellAmount] = useState(0);

  const { balance } = useBalance();



  // --- ดึงราคาจาก API ---
  const symbol = mainSymbol.endsWith("USDT") ? mainSymbol : mainSymbol + "USDT";
  const { data, loading, error } = useCryptoPrice(symbol);

  const bidPrice =
    !data || loading || error
      ? 0
      : parseFloat(data.price || data.lastPrice || "0");

  const askPrice = bidPrice;

  const buyTotal = (buyAmount * bidPrice).toFixed(4);
  const sellTotal = (sellAmount * askPrice).toFixed(4);

  const btcBalance = 0.002;
  const isBuyAmountValid = buyAmount > 0 && (buyAmount * bidPrice) <= balance;
  const isSellAmountValid = sellAmount > 0 && sellAmount <= btcBalance;

  // Validation สำหรับ Buy
  const isBuyAmountEmpty = buyAmount <= 0;
  const isBuyAmountOver = (buyAmount * bidPrice) > balance;
  const isBuyAmountError = isBuyAmountEmpty || isBuyAmountOver;

  // Validation สำหรับ Sell
  const isSellAmountEmpty = sellAmount <= 0;
  const isSellAmountOver = sellAmount > btcBalance;
  const isSellAmountError = isSellAmountEmpty || isSellAmountOver;

  const isBidPriceValid = bidPrice > 0;
  const isAskPriceValid = askPrice > 0;
  const isBuyDisabled = !isBidPriceValid || buyAmount <= 0 || (buyAmount * bidPrice) > balance;
  const isSellDisabled = !isAskPriceValid || sellAmount <= 0 || sellAmount > btcBalance;


  // ฟังก์ชันช่วยสำหรับแยกชื่อเหรียญ (เช่น BTC, ETH) จากสัญลักษณ์
  // เช่น "BINANCE:BTCUSDT" จะได้ "BTC"
  function extractBaseSymbol(symbol?: string) {
    if (!symbol) return "";
    if (symbol.includes(":")) symbol = symbol.split(":")[1];
    if (symbol.includes("/")) return symbol.split("/")[0];
    return symbol.substring(0, 3).toUpperCase();
  }

  // ตัวช่วยสำหรับแสดงราคา (รองรับ loading/error)
  const displayPrice = () => {
    if (loading) return "Loading...";
    if (error) return "Error";
    return bidPrice.toLocaleString();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="absolute -top-10 left-0 mt-7 w-[325px] z-10">
        <div className="bg-white rounded-t-xl rounded-b-none px-2 py-3 flex justify-center space-x-3 w-full">
          {["limit", "market", "stop"].map((type) => (
            <button
              key={type}
              className={`px-2 py-2 rounded-md text-sm font-medium transition ${tab === type ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              onClick={() => setTab(type as any)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} order
            </button>
          ))}
        </div>
      </div>

      <div className="absolute -top-10 left-0 mt-7 w-[325px] h-[56px] pointer-events-none rounded-xl z-0" style={{ background: "transparent", boxShadow: "0 0 12px 4px #3b82f680, 0 2px 12px #60a5fa55" }} />

      <div className="mt-8 p-4 md:p-6 rounded-xl shadow-xl bg-white z-5 relative" style={{ boxShadow: "0 0 12px 4px #3b82f680, 0 2px 12px #60a5fa55" }}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4 border rounded-md p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>My balance</span>
              <span>{balance.toLocaleString()} USD</span>
            </div>

            <div className="flex items-center border px-4 py-2 rounded-md bg-gray-50">
              <span className="text-sm text-gray-400 flex-1">Bid price</span>
              <span className="font-semibold text-lg text-gray-800">
                {loading ? "Loading..." : error ? "Error" : bidPrice.toLocaleString()}
                <span className="ml-1 text-gray-400 text-sm font-normal">USDT</span>
              </span>
            </div>

            <div className="flex items-center border px-4 py-2 rounded-md bg-white">
              <span className="text-sm text-gray-400 flex-1">Amount</span>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={buyAmount}
                onChange={(e) => setBuyAmount(Number(e.target.value))}
                className="flex-1 bg-transparent border-none outline-none text-gray-500 focus:ring-0 text-right"
              />
              <span className="text-sm text-gray-400 ml-2">{extractBaseSymbol(mainSymbol)}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  className="border text-sm text-gray-600 py-1 rounded-md hover:bg-gray-100"
                  onClick={() => {
                    if (bidPrice > 0) {
                      setBuyAmount((pct / 100) * (balance / bidPrice));
                    }
                  }}
                >
                  {pct} %
                </button>
              ))}
            </div>

            {/* เพิ่ม label Total ให้เหมือนฝั่ง Sell */}
            <div className="text-sm text-gray-500">Total</div>

            <div className={
              "flex items-center justify-between border px-4 py-2 rounded-md bg-gray-50 box-border" +
              (isBuyAmountError ? " border-2 border-red-400" : "")
            }>
              <span className="text-gray-400">{loading ? "-" : parseFloat(buyTotal).toFixed(4)}</span>
              <span className="text-sm text-gray-400">USDT</span>
            </div>


            <div className="text-xs min-h-[20px] mt-1">
              {isBuyAmountEmpty && <span className="text-red-500">กรุณากรอกจำนวน</span>}
              {isBuyAmountOver && <span className="text-red-500">ยอดเงินไม่พอ</span>}
              {!isBuyAmountError && <span>&nbsp;</span>}
            </div>


            <button
              className="w-full py-2 bg-green-600 text-white rounded-md font-semibold transition hover:bg-green-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => {
                if (!isBuyAmountValid) {
                  alert("ยอดเงินไม่พอ!");
                  return;
                }
                alert(`Buy ${buyAmount} ${mainSymbol}`);
              }}
              disabled={isBuyDisabled}
            >
              Buy
            </button>
          </div>


          <div className="space-y-4 border rounded-md p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>My balance</span>
              <span>{btcBalance.toFixed(4)} {extractBaseSymbol(mainSymbol)}</span>
            </div>

            <div className="flex items-center border px-4 py-2 rounded-md bg-gray-50">
              <span className="text-sm text-gray-400 flex-1">Ask price</span>
              <span className="font-semibold text-lg text-gray-800">
                {loading ? "Loading..." : error ? "Error" : askPrice.toLocaleString()}
                <span className="ml-1 text-gray-400 text-sm font-normal">USDT</span>
              </span>
            </div>

            <div className="flex items-center border px-4 py-2 rounded-md bg-white">
              <span className="text-sm text-gray-400 flex-1">Amount</span>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={sellAmount}
                onChange={(e) => setSellAmount(Number(e.target.value))}
                className="flex-1 bg-transparent border-none outline-none text-gray-500 focus:ring-0 text-right"
              />
              <span className="text-sm text-gray-400 ml-2">{extractBaseSymbol(mainSymbol)}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  className="border text-sm text-gray-600 py-1 rounded-md hover:bg-gray-100"
                  onClick={() => setSellAmount((pct / 100) * btcBalance)}
                >
                  {pct} %
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-500">Total</div>
            <div className={
              "flex items-center justify-between border px-4 py-2 rounded-md bg-gray-50 box-border" +
              (isSellAmountError ? " border-2 border-red-400" : "")
            }>
              <span className="text-gray-400">{loading ? "-" : parseFloat(sellTotal).toFixed(4)}</span>
              <span className="text-sm text-gray-400">USDT</span>
            </div>




            <div className="text-right text-xs text-gray-400 min-h-[20px]">
              ≈ {parseFloat(sellTotal).toFixed(4)} USD
            </div>

            <button
              className="w-full py-2 bg-red-600 text-white rounded-md font-semibold transition hover:bg-red-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => {
                if (!isSellAmountValid) {
                  alert("จำนวนเหรียญไม่พอ!");
                  return;
                }
                alert(`Sell ${sellAmount} ${mainSymbol}`);
              }}
              disabled={isSellDisabled}
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
