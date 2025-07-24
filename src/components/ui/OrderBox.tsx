"use client";

import { useState } from "react";

export default function OrderBox() {
  const [tab, setTab] = useState<"limit" | "market" | "stop">("limit");
  const [buyAmount, setBuyAmount] = useState(0.001);
  const [sellAmount, setSellAmount] = useState(0);

  const bidPrice = 118616.53;
  const askPrice = 118616.53;
  const buyTotal = (buyAmount * bidPrice).toFixed(4);
  const sellTotal = (sellAmount * askPrice).toFixed(4);

  const btcBalance = 0.002;
  const usdtBalance = 10000;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Tabs aligned to left and match design */}
      <div className="absolute -top-10 left-0">
        <div className="bg-white rounded-t-xl rounded-b-none px-2 py-3 flex space-x-1.5">
          {["limit", "market", "stop"].map((type) => (
            <button
              key={type}
              className={`px-2 py-1.5 rounded-md text-sm font-medium transition ${
                tab === type
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setTab(type as any)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} order
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 md:p-6 rounded-xl shadow-xl border bg-white">
        {/* Order Boxes */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Buy Box */}
          <div className="space-y-4 border rounded-md p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>My balance</span>
              <span>{usdtBalance.toLocaleString()} USD</span>
            </div>

            <div className="flex items-center border px-4 py-2 rounded-md bg-gray-50">
              <span className="text-sm text-gray-400 flex-1">Bid price</span>
              <span className="font-semibold text-lg text-gray-800">
                {bidPrice.toLocaleString()}
                <span className="ml-1 text-gray-400 text-sm font-normal">
                  USDT
                </span>
              </span>
            </div>

            {/* Buy Box - Amount */}
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
              <span className="text-sm text-gray-400 ml-2">BTC</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  className="border text-sm text-gray-600 py-1 rounded-md hover:bg-gray-100"
                  onClick={() => setBuyAmount((pct / 100) * 0.001)}
                >
                  {pct} %
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-500">Total</div>
            <div className="flex items-center justify-between border px-4 py-2 rounded-md bg-gray-50">
              <span className="text-gray-400">
                {parseFloat(buyTotal).toFixed(4)}
              </span>
              <span className="text-sm text-gray-400">USDT</span>
            </div>

            <div className="text-right text-xs text-gray-400">
              ≈ {parseFloat(buyTotal).toFixed(4)} USD
            </div>

            <button className="w-full py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition">
              Buy
            </button>
          </div>

          {/* Sell Box */}
          <div className="space-y-4 border rounded-md p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>My balance</span>
              <span>{btcBalance.toFixed(4)} BTC</span>
            </div>

            <div className="flex items-center border px-4 py-2 rounded-md bg-gray-50">
              <span className="text-sm text-gray-400 flex-1">Ask price</span>
              <span className="font-semibold text-lg text-gray-800">
                {askPrice.toLocaleString()}
                <span className="ml-1 text-gray-400 text-sm font-normal">
                  USDT
                </span>
              </span>
            </div>

            {/* Sell Box - Amount */}
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
              <span className="text-sm text-gray-400 ml-2">BTC</span>
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
            <div className="flex items-center justify-between border px-4 py-2 rounded-md bg-gray-50">
              <span className="text-gray-400">
                {parseFloat(sellTotal).toFixed(4)}
              </span>
              <span className="text-sm text-gray-400">USDT</span>
            </div>

            <div className="text-right text-xs text-gray-400">
              ≈ {parseFloat(sellTotal).toFixed(4)} USD
            </div>

            <button className="w-full py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition">
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
