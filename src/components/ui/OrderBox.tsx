"use client";

import { useState, useMemo } from "react";
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
  const [buyLimitPrice, setBuyLimitPrice] = useState(0);
  const [sellLimitPrice, setSellLimitPrice] = useState(0);
  const [buyStopPrice, setBuyStopPrice] = useState(0);
  const [sellStopPrice, setSellStopPrice] = useState(0);
  const [buyStopLimitPrice, setBuyStopLimitPrice] = useState(0);
  const [sellStopLimitPrice, setSellStopLimitPrice] = useState(0);
  const [buyAttempted, setBuyAttempted] = useState(false);
  const [sellAttempted, setSellAttempted] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0.0);

  const { balance, setBalance } = useBalance();

  const symbol = mainSymbol.endsWith("USDT") ? mainSymbol : mainSymbol + "USDT";
  const { data, error } = useCryptoPrice(symbol);

  const marketBidPrice =
    !data || error ? 0 : parseFloat(data.price || data.lastPrice || "0");
  const marketAskPrice = marketBidPrice;

  // ใช้ useMemo เพื่อป้องกันการคำนวณซ้ำและกระพริบ
  const { effectiveBuyPrice, effectiveSellPrice, buyTotal, sellTotal } =
    useMemo(() => {
      let buyPrice = 0;
      let sellPrice = 0;

      switch (tab) {
        case "limit":
          buyPrice = buyLimitPrice;
          sellPrice = sellLimitPrice;
          break;
        case "market":
          buyPrice = marketBidPrice;
          sellPrice = marketAskPrice;
          break;
        case "stop":
          // สำหรับ stop order ใช้ stop limit price หรือ market price
          buyPrice = buyStopLimitPrice || marketBidPrice;
          sellPrice = sellStopLimitPrice || marketAskPrice;
          break;
      }

      // คำนวณ total แต่ถ้าไม่มีข้อมูลให้แสดง 0
      const calculatedBuyTotal =
        buyAmount && buyPrice ? buyAmount * buyPrice : 0;
      const calculatedSellTotal =
        sellAmount && sellPrice ? sellAmount * sellPrice : 0;

      return {
        effectiveBuyPrice: buyPrice,
        effectiveSellPrice: sellPrice,
        buyTotal: calculatedBuyTotal.toFixed(4),
        sellTotal: calculatedSellTotal.toFixed(4),
      };
    }, [
      tab,
      buyAmount,
      sellAmount,
      buyLimitPrice,
      sellLimitPrice,
      buyStopPrice,
      sellStopPrice,
      buyStopLimitPrice,
      sellStopLimitPrice,
      marketBidPrice,
      marketAskPrice,
    ]);

  const isBuyAmountValid =
    buyAmount > 0 && buyAmount * effectiveBuyPrice <= balance;
  const isSellAmountValid = sellAmount > 0 && sellAmount <= coinBalance;

  const isBuyAmountEmpty = buyAmount <= 0;
  const isBuyAmountOver = buyAmount * effectiveBuyPrice > balance;
  const isBuyAmountError = isBuyAmountEmpty || isBuyAmountOver;

  const isBuyPriceEmpty =
    (tab === "limit" && buyLimitPrice <= 0) ||
    (tab === "stop" && (buyStopPrice <= 0 || buyStopLimitPrice <= 0));

  const isSellAmountEmpty = sellAmount <= 0;
  const isSellAmountOver = sellAmount > coinBalance;
  const isSellAmountError = isSellAmountEmpty || isSellAmountOver;

  const isSellPriceEmpty =
    (tab === "limit" && sellLimitPrice <= 0) ||
    (tab === "stop" && (sellStopPrice <= 0 || sellStopLimitPrice <= 0));

  const isBuyPriceValid =
    tab === "limit"
      ? buyLimitPrice > 0
      : tab === "market"
      ? marketBidPrice > 0
      : tab === "stop"
      ? buyStopPrice > 0 && buyStopLimitPrice > 0
      : false;

  const isSellPriceValid =
    tab === "limit"
      ? sellLimitPrice > 0
      : tab === "market"
      ? marketAskPrice > 0
      : tab === "stop"
      ? sellStopPrice > 0 && sellStopLimitPrice > 0
      : false;

  const isBuyDisabled =
    !isBuyPriceValid ||
    buyAmount <= 0 ||
    buyAmount * effectiveBuyPrice > balance;
  const isSellDisabled =
    !isSellPriceValid || sellAmount <= 0 || sellAmount > coinBalance;

  const shouldShowBuyRedBorder =
    (buyAttempted && (isBuyAmountError || isBuyPriceEmpty)) ||
    (!isBuyPriceValid && buyAttempted);
  const shouldShowSellRedBorder =
    (sellAttempted && (isSellAmountError || isSellPriceEmpty)) ||
    (!isSellPriceValid && sellAttempted);

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
    const orderType =
      tab === "limit" ? "Limit" : tab === "market" ? "Market" : "Stop";

    // Error: จำนวนไม่ถูกต้อง
    if (buyAmount <= 0) {
      if (onAlert) {
        onAlert(
          `${orderType} Buy Order Unsuccessful`,
          <>
            Your {tab} order Buy {getShortSymbol(mainSymbol)} total 0 USDT{" "}
            <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }

    // Error: ราคาไม่ถูกต้อง
    if (tab === "limit" && buyLimitPrice <= 0) {
      if (onAlert) {
        onAlert(
          `${orderType} Buy Order Unsuccessful`,
          <>
            Your {tab} order Buy {getShortSymbol(mainSymbol)} total{" "}
            {(buyAmount * buyLimitPrice).toFixed(4)} USDT <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }

    // Error: Stop order validation
    if (tab === "stop" && (buyStopPrice <= 0 || buyStopLimitPrice <= 0)) {
      if (onAlert) {
        onAlert(
          `${orderType} Buy Order Unsuccessful`,
          <>
            Your {tab} order Buy {getShortSymbol(mainSymbol)} total{" "}
            {(buyAmount * effectiveBuyPrice).toFixed(4)} USDT <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }

    // Error: เงินไม่พอ
    if (buyAmount * effectiveBuyPrice > balance) {
      if (onAlert) {
        onAlert(
          `${orderType} Buy Order Unsuccessful`,
          <>
            Your {tab} order Buy {getShortSymbol(mainSymbol)} total{" "}
            {(buyAmount * effectiveBuyPrice).toFixed(4)} USDT <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }

    // Error: ไม่มีราคาตลาด (สำหรับ market order)
    if (tab === "market" && marketBidPrice <= 0) {
      if (onAlert) {
        onAlert(
          `${orderType} Buy Order Unsuccessful`,
          <>
            Your {tab} order Buy {getShortSymbol(mainSymbol)} total{" "}
            {(buyAmount * effectiveBuyPrice).toFixed(4)} USDT <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }

    // Success!
    const totalCost = buyAmount * effectiveBuyPrice;
    setBalance(balance - totalCost);
    setCoinBalance(coinBalance + buyAmount);
    setBuyAmount(0);

    // Reset prices based on tab
    if (tab === "limit") setBuyLimitPrice(0);
    if (tab === "stop") {
      setBuyStopPrice(0);
      setBuyStopLimitPrice(0);
    }
    setBuyAttempted(false);

    const newTransaction: Transaction = {
      id: generateTransactionId(),
      type: "buy",
      symbol: extractBaseSymbol(mainSymbol),
      amount: buyAmount,
      price: effectiveBuyPrice,
      total: totalCost,
      timestamp: new Date(),
    };

    onNewTransaction(newTransaction);

    if (onAlert) {
      onAlert(
        `${orderType} Buy Order Placed`,
        <>
          Your {tab} order Buy {getShortSymbol(mainSymbol)} total{" "}
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
    const orderType =
      tab === "limit" ? "Limit" : tab === "market" ? "Market" : "Stop";

    // Error: จำนวนขายผิด
    if (sellAmount <= 0) {
      if (onAlert) {
        onAlert(
          `${orderType} Sell Order Unsuccessful`,
          <>
            Your {tab} order Sell {shortSymbol} total 0 USDT <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }

    // Error: ราคาไม่ถูกต้อง (สำหรับ limit order)
    if (tab === "limit" && sellLimitPrice <= 0) {
      if (onAlert) {
        onAlert(
          `${orderType} Sell Order Unsuccessful`,
          <>
            Your {tab} order Sell {shortSymbol} total {sellTotal} USDT <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }

    // Error: Stop order validation
    if (tab === "stop" && (sellStopPrice <= 0 || sellStopLimitPrice <= 0)) {
      if (onAlert) {
        onAlert(
          `${orderType} Sell Order Unsuccessful`,
          <>
            Your {tab} order Sell {shortSymbol} total {sellTotal} USDT <br />
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
          `${orderType} Sell Order Unsuccessful`,
          <>
            Your {tab} order Sell {shortSymbol} total {sellTotal} USDT <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }

    // Error: ไม่มีราคาขาย (สำหรับ market order)
    if (tab === "market" && marketAskPrice <= 0) {
      if (onAlert) {
        onAlert(
          `${orderType} Sell Order Unsuccessful`,
          <>
            Your {tab} order Sell {shortSymbol} total {sellTotal} USDT <br />
            Submitted <span className="text-red-500">Unsuccessfully</span>
          </>,
          "error"
        );
      }
      return;
    }

    // Success!
    const totalReceived = sellAmount * effectiveSellPrice;
    setBalance(balance + totalReceived);
    setCoinBalance(coinBalance - sellAmount);
    setSellAmount(0);

    // Reset prices based on tab
    if (tab === "limit") setSellLimitPrice(0);
    if (tab === "stop") {
      setSellStopPrice(0);
      setSellStopLimitPrice(0);
    }
    setSellAttempted(false);

    const newTransaction: Transaction = {
      id: generateTransactionId(),
      type: "sell",
      symbol: extractBaseSymbol(mainSymbol),
      amount: sellAmount,
      price: effectiveSellPrice,
      total: totalReceived,
      timestamp: new Date(),
    };

    onNewTransaction(newTransaction);

    if (onAlert) {
      onAlert(
        `${orderType} Sell Order Placed`,
        <>
          Your {tab} order Sell {shortSymbol} total {totalReceived.toFixed(4)}{" "}
          USDT <br />
          Submitted <span className="text-teal-500">Successfully</span>
        </>,
        "success"
      );
    }
  };

  // ฟังก์ชันสำหรับ render price fields ตาม tab
  const renderPriceFields = (side: "buy" | "sell") => {
    const isBuy = side === "buy";
    const priceLabel = isBuy
      ? tab === "limit"
        ? "Bid price"
        : tab === "market"
        ? "Market price"
        : "Stop price"
      : tab === "limit"
      ? "Ask price"
      : tab === "market"
      ? "Market price"
      : "Stop price";

    if (tab === "market") {
      const price = isBuy ? marketBidPrice : marketAskPrice;
      return (
        <div className="flex items-center border px-4 py-2 rounded-md bg-gray-100">
          <span className="text-sm text-gray-400 flex-1">{priceLabel}</span>
          <span className="font-semibold text-lg text-gray-800">
            {error
              ? "Error"
              : price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            <span className="ml-1 text-gray-400 text-sm font-normal">USDT</span>
          </span>
        </div>
      );
    }

    if (tab === "limit") {
      const price = isBuy ? buyLimitPrice : sellLimitPrice;
      const setPrice = isBuy ? setBuyLimitPrice : setSellLimitPrice;

      return (
        <div className="flex items-center border px-4 py-2 rounded-md bg-white">
          <span className="text-sm text-gray-400 flex-1">{priceLabel}</span>
          <div className="flex items-center">
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="bg-transparent border-none outline-none text-gray-800 font-semibold text-lg focus:ring-0 text-right w-32"
              placeholder="0.00"
            />
            <span className="ml-1 text-gray-400 text-sm font-normal">USDT</span>
          </div>
        </div>
      );
    }

    if (tab === "stop") {
      const stopPrice = isBuy ? buyStopPrice : sellStopPrice;
      const limitPrice = isBuy ? buyStopLimitPrice : sellStopLimitPrice;
      const setStopPrice = isBuy ? setBuyStopPrice : setSellStopPrice;
      const setLimitPrice = isBuy
        ? setBuyStopLimitPrice
        : setSellStopLimitPrice;

      return (
        <>
          <div className="flex items-center border px-4 py-2 rounded-md bg-white">
            <span className="text-sm text-gray-400 flex-1">Stop price</span>
            <div className="flex items-center">
              <input
                type="number"
                step="0.01"
                min="0"
                value={stopPrice}
                onChange={(e) => setStopPrice(Number(e.target.value))}
                className="bg-transparent border-none outline-none text-gray-800 font-semibold text-lg focus:ring-0 text-right w-32"
                placeholder="0.00"
              />
              <span className="ml-1 text-gray-400 text-sm font-normal">
                USDT
              </span>
            </div>
          </div>
          <div className="flex items-center border px-4 py-2 rounded-md bg-white">
            <span className="text-sm text-gray-400 flex-1">Limit price</span>
            <div className="flex items-center">
              <input
                type="number"
                step="0.01"
                min="0"
                value={limitPrice}
                onChange={(e) => setLimitPrice(Number(e.target.value))}
                className="bg-transparent border-none outline-none text-gray-800 font-semibold text-lg focus:ring-0 text-right w-32"
                placeholder="0.00"
              />
              <span className="ml-1 text-gray-400 text-sm font-normal">
                USDT
              </span>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Tab Navigation */}
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
              onClick={() => setTab(type as "limit" | "market" | "stop")}
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
              <span>{balance.toFixed(4)} USD</span>
            </div>

            {/* Price Fields */}
            {renderPriceFields("buy")}

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
                    if (effectiveBuyPrice > 0) {
                      setBuyAmount((pct / 100) * (balance / effectiveBuyPrice));
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
              <span className="text-gray-400">{buyTotal}</span>
              <span className="text-sm text-gray-400">USDT</span>
            </div>

            <div className="text-right text-xs text-gray-400 min-h-[20px]">
              {buyAttempted &&
              (isBuyAmountError || isBuyPriceEmpty || !isBuyPriceValid) ? (
                <span className="text-red-500">
                  {!isBuyPriceValid && tab === "market"
                    ? "Price not available"
                    : isBuyPriceEmpty
                    ? tab === "stop"
                      ? "Please enter stop and limit prices"
                      : "Please enter the price"
                    : isBuyAmountEmpty
                    ? "Please enter the amount"
                    : "Your balance is insufficient"}
                </span>
              ) : (
                <>≈ {buyTotal} USD</>
              )}
            </div>

            <button
              className="w-full py-2 text-white rounded-md font-semibold transition cursor-pointer"
              style={{ backgroundColor: "rgba(48, 156, 125, 1)" }}
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

            {/* Price Fields */}
            {renderPriceFields("sell")}

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
              <span className="text-gray-400">{sellTotal}</span>
              <span className="text-sm text-gray-400">USDT</span>
            </div>

            <div className="text-right text-xs text-gray-400 min-h-[20px]">
              {sellAttempted &&
              (isSellAmountError || isSellPriceEmpty || !isSellPriceValid) ? (
                <span className="text-red-500">
                  {!isSellPriceValid && tab === "market"
                    ? "Price not available"
                    : isSellPriceEmpty
                    ? tab === "stop"
                      ? "Please enter stop and limit prices"
                      : "Please enter the price"
                    : isSellAmountEmpty
                    ? "Please enter the amount"
                    : "Your balance is insufficient"}
                </span>
              ) : (
                <>≈ {sellTotal} USD</>
              )}
            </div>

            <button
              className="w-full py-2 text-white rounded-md font-semibold transition cursor-pointer"
              style={{ backgroundColor: "rgba(198, 60, 60, 1)" }}
              onClick={handleBuy}
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
