"use client";

import { useState } from "react";
import { useBalance } from "@/components/contexts/BalanceContext";
import { useCryptoPrice } from "@/hooks/useCryptoPrice";
import type { Transaction } from "@/components/ui/TradeHistoryTable";

// ฟังก์ชันแปลง symbol ยาวเป็นแบบ BTC/USDT
function getShortSymbol(symbol: string): string {
  if (symbol.includes(":")) symbol = symbol.split(":")[1];
  if (symbol.includes("/")) return symbol;
  if (symbol.endsWith("USDT")) {
    return symbol.replace("USDT", "/USDT"); // BTCUSDT → BTC/USDT
  }
  // เผื่อรองรับอนาคตเช่น ETHBTC → ETH/BTC
  if (symbol.length >= 6) {
    const base = symbol.slice(0, symbol.length - 3);
    const quote = symbol.slice(-3);
    return `${base}/${quote}`;
  }
  return symbol;
}

interface OrderBoxProps {
  mainSymbol?: string;
  onNewTransaction: (tx: Transaction) => void;
  onAlert?: (
    title: string,
    message: React.ReactNode,
    status?: "success" | "error"
  ) => void;
}

export default function OrderBox({
  mainSymbol = "BTC",
  onNewTransaction,
  onAlert,
}: OrderBoxProps) {
  const [tab, setTab] = useState<"limit" | "market" | "stop">("limit");
  const [buyAmount, setBuyAmount] = useState(0);
  const [sellAmount, setSellAmount] = useState(0);
  const [buyAttempted, setBuyAttempted] = useState(false);
  const [sellAttempted, setSellAttempted] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0.0);

  const { balance, setBalance } = useBalance();

  const symbol = mainSymbol.endsWith("USDT") ? mainSymbol : mainSymbol + "USDT";
  const { data, loading, error } = useCryptoPrice(symbol);

  const bidPrice =
    !data || error ? 0 : parseFloat(data.price || data.lastPrice || "0");
  const askPrice = bidPrice;

  const buyTotal = (buyAmount * bidPrice).toFixed(4);
  const sellTotal = (sellAmount * askPrice).toFixed(4);

  const isBuyAmountValid = buyAmount > 0 && buyAmount * bidPrice <= balance;
  const isSellAmountValid = sellAmount > 0 && sellAmount <= coinBalance;

  const isBuyAmountEmpty = buyAmount <= 0;
  const isBuyAmountOver = buyAmount * bidPrice > balance;
  const isBuyAmountError = isBuyAmountEmpty || isBuyAmountOver;

  const isSellAmountEmpty = sellAmount <= 0;
  const isSellAmountOver = sellAmount > coinBalance;
  const isSellAmountError = isSellAmountEmpty || isSellAmountOver;

  const isBidPriceValid = bidPrice > 0;
  const isAskPriceValid = askPrice > 0;
  const isBuyDisabled =
    !isBidPriceValid || buyAmount <= 0 || buyAmount * bidPrice > balance;
  const isSellDisabled =
    !isAskPriceValid || sellAmount <= 0 || sellAmount > coinBalance;

  const shouldShowBuyRedBorder =
    (buyAttempted && isBuyAmountError) || (!isBidPriceValid && buyAttempted);
  const shouldShowSellRedBorder =
    (sellAttempted && isSellAmountError) || (!isAskPriceValid && sellAttempted);

  function extractBaseSymbol(symbol?: string) {
    if (!symbol) return "";
    if (symbol.includes(":")) symbol = symbol.split(":")[1];
    if (symbol.includes("/")) return symbol.split("/")[0];
    return symbol.substring(0, 3).toUpperCase();
  }

  const generateTransactionId = () =>
    Date.now().toString(36) + Math.random().toString(36).substr(2);

  // ------ ฟังก์ชัน Buy ------
  const handleBuy = () => {
    setBuyAttempted(true);

    // Error: จำนวนไม่ถูกต้อง
    if (buyAmount <= 0) {
      if (onAlert) {
        onAlert(
          "Limit Buy Order Unsuccessful",
          <>
            Your limit order Buy {getShortSymbol(mainSymbol)} total 0 USDT{" "}
            <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }
    // Error: เงินไม่พอ
    if (buyAmount * bidPrice > balance) {
      if (onAlert) {
        onAlert(
          "Limit Buy Order Unsuccessful",
          <>
            Your limit order Buy {getShortSymbol(mainSymbol)} total{" "}
            {(buyAmount * bidPrice).toFixed(4)} USDT <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }
    // Error: ไม่มีราคา
    if (bidPrice <= 0) {
      if (onAlert) {
        onAlert(
          "Limit Buy Order Unsuccessful",
          <>
            Your limit order Buy {getShortSymbol(mainSymbol)} total{" "}
            {(buyAmount * bidPrice).toFixed(4)} USDT <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }

    // Success!
    const totalCost = buyAmount * bidPrice;
    setBalance(balance - totalCost);
    setCoinBalance(coinBalance + buyAmount);
    setBuyAmount(0);
    setBuyAttempted(false);

    const newTransaction: Transaction = {
      id: generateTransactionId(),
      type: "buy",
      symbol: extractBaseSymbol(mainSymbol),
      amount: buyAmount,
      price: bidPrice,
      total: totalCost,
      timestamp: new Date(),
    };

    onNewTransaction(newTransaction);

    if (onAlert) {
      onAlert(
        "Limit Buy Order Placed",
        <>
          Your limit order Buy {getShortSymbol(mainSymbol)} total{" "}
          {totalCost.toFixed(4)} USDT <br />
          Submitted <span className="text-teal-500">Successfully</span>
        </>,
        "success"
      );
    }
  };

  // ------ ฟังก์ชัน Sell ------
  const handleSell = () => {
    setSellAttempted(true);
    const shortSymbol = getShortSymbol(mainSymbol);

    // Error: จำนวนขายผิด
    if (sellAmount <= 0) {
      if (onAlert) {
        onAlert(
          "Limit Sell Order Unsuccessful",
          <>
            Your limit order Sell {shortSymbol} total 0 USDT <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }
    // Error: ขายเกินเหรียญที่มี
    if (sellAmount > coinBalance) {
      if (onAlert) {
        onAlert(
          "Limit Sell Order Unsuccessful",
          <>
            Your limit order Sell {shortSymbol} total {sellTotal} USDT <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }
    // Error: ไม่มีราคาขาย
    if (askPrice <= 0) {
      if (onAlert) {
        onAlert(
          "Limit Sell Order Unsuccessful",
          <>
            Your limit order Sell {shortSymbol} total {sellTotal} USDT <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }

    // Success!
    const totalReceived = sellAmount * askPrice;
    setBalance(balance + totalReceived);
    setCoinBalance(coinBalance - sellAmount);
    setSellAmount(0);
    setSellAttempted(false);

    const newTransaction: Transaction = {
      id: generateTransactionId(),
      type: "sell",
      symbol: extractBaseSymbol(mainSymbol),
      amount: sellAmount,
      price: askPrice,
      total: totalReceived,
      timestamp: new Date(),
    };

    onNewTransaction(newTransaction);

    if (onAlert) {
      onAlert(
        "Limit Sell Order Placed",
        <>
          Your limit order Sell {shortSymbol} total {totalReceived.toFixed(4)}{" "}
          USDT <br />
          Submitted <span className="text-teal-500">Successfully</span>
        </>,
        "success"
      );
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* --- Panel เดิมทั้งหมด ไม่ตัดออกแม้แต่บรรทัดเดียว --- */}
      <div className="absolute -top-10 left-0 mt-7 w-[325px] z-10">
        <div className="bg-white rounded-t-xl rounded-b-none px-2 py-3 flex justify-center space-x-3 w-full">
          {["limit", "market", "stop"].map((type) => (
            <button
              key={type}
              className={`px-2 py-2 rounded-md text-sm font-medium transition ${
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

      <div
        className="absolute -top-10 left-0 mt-7 w-[325px] h-[56px] pointer-events-none rounded-xl z-0"
        style={{
          background: "transparent",
          boxShadow: "0 0 12px 4px #3b82f680, 0 2px 12px #60a5fa55",
        }}
      />

      <div
        className="mt-8 p-4 md:p-6 rounded-xl shadow-xl bg-white z-5 relative"
        style={{ boxShadow: "0 0 12px 4px #3b82f680, 0 2px 12px #60a5fa55" }}
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Buy Panel */}
          <div className="space-y-4 border rounded-md p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>My balance</span>
              <span>{balance.toLocaleString()} USD</span>
            </div>
            <div className="flex items-center border px-4 py-2 rounded-md bg-gray-50">
              <span className="text-sm text-gray-400 flex-1">Bid price</span>
              <span className="font-semibold text-lg text-gray-800">
                {error
                  ? "Error"
                  : bidPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                <span className="ml-1 text-gray-400 text-sm font-normal">
                  USDT
                </span>
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
              <span className="text-sm text-gray-400 ml-2">
                {extractBaseSymbol(mainSymbol)}
              </span>
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
            <div className="text-sm text-gray-500">Total</div>
            <div
              className={
                "flex items-center justify-between border px-4 py-2 rounded-md bg-gray-50 box-border" +
                (shouldShowBuyRedBorder ? " border-1 border-red-400" : "")
              }
            >
              <span className="text-gray-400">
                {loading ? "-" : parseFloat(buyTotal).toFixed(4)}
              </span>
              <span className="text-sm text-gray-400">USDT</span>
            </div>
            <div className="text-right text-xs text-gray-400 min-h-[20px]">
              {buyAttempted && (isBuyAmountError || !isBidPriceValid) ? (
                <span className="text-red-500">
                  {!isBidPriceValid
                    ? "Price not available"
                    : isBuyAmountEmpty
                    ? "Please enter the amount"
                    : "Your balance is insufficient"}
                </span>
              ) : (
                <>≈ {parseFloat(buyTotal).toFixed(4)} USD</>
              )}
            </div>
            <button
              className="w-full py-2 bg-green-600 text-white rounded-md font-semibold transition hover:bg-green-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleBuy}
            >
              Buy
            </button>
          </div>
          {/* Sell Panel */}
          <div className="space-y-4 border rounded-md p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>My balance</span>
              <span>
                {coinBalance.toFixed(4)} {extractBaseSymbol(mainSymbol)}
              </span>
            </div>
            <div className="flex items-center border px-4 py-2 rounded-md bg-gray-50">
              <span className="text-sm text-gray-400 flex-1">Ask price</span>
              <span className="font-semibold text-lg text-gray-800">
                {error
                  ? "Error"
                  : askPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                <span className="ml-1 text-gray-400 text-sm font-normal">
                  USDT
                </span>
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
              <span className="text-sm text-gray-400 ml-2">
                {extractBaseSymbol(mainSymbol)}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  className="border text-sm text-gray-600 py-1 rounded-md hover:bg-gray-100"
                  onClick={() => setSellAmount((pct / 100) * coinBalance)}
                >
                  {pct} %
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-500">Total</div>
            <div
              className={
                "flex items-center justify-between border px-4 py-2 rounded-md bg-gray-50 box-border" +
                (shouldShowSellRedBorder ? " border-1 border-red-400" : "")
              }
            >
              <span className="text-gray-400">
                {loading ? "-" : parseFloat(sellTotal).toFixed(4)}
              </span>
              <span className="text-sm text-gray-400">USDT</span>
            </div>
            <div className="text-right text-xs text-gray-400 min-h-[20px]">
              {sellAttempted && (isSellAmountError || !isAskPriceValid) ? (
                <span className="text-red-500">
                  {!isAskPriceValid
                    ? "Price not available"
                    : isSellAmountEmpty
                    ? "Please enter the amount"
                    : "Your balance is insufficient"}
                </span>
              ) : (
                <>≈ {parseFloat(sellTotal).toFixed(4)} USD</>
              )}
            </div>
            <button
              className="w-full py-2 bg-red-600 text-white rounded-md font-semibold transition hover:bg-red-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSell}
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
