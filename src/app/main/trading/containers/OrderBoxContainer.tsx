"use client";

import { useState, useMemo } from "react";
import { useBalance } from "../contexts/BalanceContext";
import { useCryptoPrice } from "@/app/main/trading/hooks/useCryptoPrice";
import type { Transaction } from "@/app/main/trading/components/TradeHistoryTable";
import OrderBox from "@/app/main/trading/components/OrderBox";

// ฟังก์ชันแปลง symbol ยาวเป็นแบบ BTC/USDT
function getShortSymbol(symbol: string): string {
  if (symbol.includes(":")) symbol = symbol.split(":")[1];
  if (symbol.includes("/")) return symbol;
  if (symbol.endsWith("USDT")) {
    return symbol.replace("USDT", "/USDT"); // BTCUSDT → BTC/USDT
  }
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

export default function OrderBoxContainer({
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
          buyPrice = buyStopLimitPrice || marketBidPrice;
          sellPrice = sellStopLimitPrice || marketAskPrice;
          break;
      }

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

  const isBuyAmountEmpty = buyAmount <= 0; // Define here
  const isBuyAmountOver = buyAmount * effectiveBuyPrice > balance;
  const isBuyAmountError = isBuyAmountEmpty || isBuyAmountOver;

  const isSellAmountEmpty = sellAmount <= 0; // Define here
  const isSellAmountOver = sellAmount > coinBalance;
  const isSellAmountError = isSellAmountEmpty || isSellAmountOver;

  const isBuyPriceEmpty =
    (tab === "limit" && buyLimitPrice <= 0) ||
    (tab === "stop" && (buyStopPrice <= 0 || buyStopLimitPrice <= 0));

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

  const handleBuy = () => {
    setBuyAttempted(true);
    const orderType =
      tab === "limit" ? "Limit" : tab === "market" ? "Market" : "Stop";

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

    const totalCost = buyAmount * effectiveBuyPrice;
    setBalance(balance - totalCost);
    setCoinBalance(coinBalance + buyAmount);
    setBuyAmount(0);

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

  const handleSell = () => {
    setSellAttempted(true);
    const shortSymbol = getShortSymbol(mainSymbol);
    const orderType =
      tab === "limit" ? "Limit" : tab === "market" ? "Market" : "Stop";

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

    const totalReceived = sellAmount * effectiveSellPrice;
    setBalance(balance + totalReceived);
    setCoinBalance(coinBalance - sellAmount);
    setSellAmount(0);

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

  return (
    <OrderBox
      tab={tab}
      setTab={setTab}
      mainSymbol={mainSymbol}
      balance={balance}
      coinBalance={coinBalance}
      buyAmount={buyAmount}
      setBuyAmount={setBuyAmount}
      sellAmount={sellAmount}
      setSellAmount={setSellAmount}
      buyLimitPrice={buyLimitPrice}
      setBuyLimitPrice={setBuyLimitPrice}
      sellLimitPrice={sellLimitPrice}
      setSellLimitPrice={setSellLimitPrice}
      buyStopPrice={buyStopPrice}
      setBuyStopPrice={setBuyStopPrice}
      sellStopPrice={sellStopPrice}
      setSellStopPrice={setSellStopPrice}
      buyStopLimitPrice={buyStopLimitPrice}
      setBuyStopLimitPrice={setBuyStopLimitPrice}
      sellStopLimitPrice={sellStopLimitPrice}
      setSellStopLimitPrice={setSellStopLimitPrice}
      marketBidPrice={marketBidPrice}
      marketAskPrice={marketAskPrice}
      effectiveBuyPrice={effectiveBuyPrice}
      effectiveSellPrice={effectiveSellPrice}
      buyTotal={buyTotal}
      sellTotal={sellTotal}
      isBuyAmountError={isBuyAmountError}
      isSellAmountError={isSellAmountError}
      isBuyPriceEmpty={isBuyPriceEmpty}
      isSellPriceEmpty={isSellPriceEmpty}
      isBuyPriceValid={isBuyPriceValid}
      isSellPriceValid={isSellPriceValid}
      buyAttempted={buyAttempted}
      sellAttempted={sellAttempted}
      handleBuy={handleBuy}
      handleSell={handleSell}
      extractBaseSymbol={extractBaseSymbol}
      error={!!error} // Convert string | null to boolean
      isBuyAmountEmpty={isBuyAmountEmpty}
      isSellAmountEmpty={isSellAmountEmpty}
    />
  );
}
