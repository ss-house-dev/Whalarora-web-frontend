import { Dispatch, SetStateAction } from "react";
import LimitOrder from "./LimitOrder";
import MarketOrder from "./MarketOrder";
import StopOrder from "./StopOrder";

interface OrderBoxProps {
  tab: "limit" | "market" | "stop";
  setTab: Dispatch<SetStateAction<"limit" | "market" | "stop">>;
  mainSymbol: string;
  balance: number;
  coinBalance: number;
  buyAmount: number;
  setBuyAmount: Dispatch<SetStateAction<number>>;
  sellAmount: number;
  setSellAmount: Dispatch<SetStateAction<number>>;
  buyLimitPrice: number;
  setBuyLimitPrice: Dispatch<SetStateAction<number>>;
  sellLimitPrice: number;
  setSellLimitPrice: Dispatch<SetStateAction<number>>;
  buyStopPrice: number;
  setBuyStopPrice: Dispatch<SetStateAction<number>>;
  sellStopPrice: number;
  setSellStopPrice: Dispatch<SetStateAction<number>>;
  buyStopLimitPrice: number;
  setBuyStopLimitPrice: Dispatch<SetStateAction<number>>;
  sellStopLimitPrice: number;
  setSellStopLimitPrice: Dispatch<SetStateAction<number>>;
  marketBidPrice: number;
  marketAskPrice: number;
  effectiveBuyPrice: number;
  effectiveSellPrice: number;
  buyTotal: string;
  sellTotal: string;
  isBuyAmountError: boolean;
  isSellAmountError: boolean;
  isBuyPriceEmpty: boolean;
  isSellPriceEmpty: boolean;
  isBuyPriceValid: boolean;
  isSellPriceValid: boolean;
  buyAttempted: boolean;
  sellAttempted: boolean;
  handleBuy: () => void;
  handleSell: () => void;
  extractBaseSymbol: (symbol?: string) => string;
  error: boolean;
  isBuyAmountEmpty: boolean; 
  isSellAmountEmpty: boolean; 
}

export default function OrderBox({
  tab,
  setTab,
  mainSymbol,
  balance,
  coinBalance,
  buyAmount,
  setBuyAmount,
  sellAmount,
  setSellAmount,
  buyLimitPrice,
  setBuyLimitPrice,
  sellLimitPrice,
  setSellLimitPrice,
  buyStopPrice,
  setBuyStopPrice,
  sellStopPrice,
  setSellStopPrice,
  buyStopLimitPrice,
  setBuyStopLimitPrice,
  sellStopLimitPrice,
  setSellStopLimitPrice,
  marketBidPrice,
  marketAskPrice,
  effectiveBuyPrice,
  effectiveSellPrice,
  buyTotal,
  sellTotal,
  isBuyAmountError,
  isSellAmountError,
  isBuyPriceEmpty,
  isSellPriceEmpty,
  isBuyPriceValid,
  isSellPriceValid,
  buyAttempted,
  sellAttempted,
  handleBuy,
  handleSell,
  extractBaseSymbol,
  error,
  isBuyAmountEmpty, 
  isSellAmountEmpty, 
}: OrderBoxProps) {
  const shouldShowBuyRedBorder =
    (buyAttempted && (isBuyAmountError || isBuyPriceEmpty)) ||
    (!isBuyPriceValid && buyAttempted);
  const shouldShowSellRedBorder =
    (sellAttempted && (isSellAmountError || isSellPriceEmpty)) ||
    (!isSellPriceValid && sellAttempted);

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
      return (
        <MarketOrder
          price={isBuy ? marketBidPrice : marketAskPrice}
          priceLabel={priceLabel}
          error={error}
        />
      );
    }

    if (tab === "limit") {
      return (
        <LimitOrder
          price={isBuy ? buyLimitPrice : sellLimitPrice}
          setPrice={isBuy ? setBuyLimitPrice : setSellLimitPrice}
          priceLabel={priceLabel}
        />
      );
    }

    if (tab === "stop") {
      return (
        <StopOrder
          stopPrice={isBuy ? buyStopPrice : sellStopPrice}
          setStopPrice={isBuy ? setBuyStopPrice : setSellStopPrice}
          limitPrice={isBuy ? buyStopLimitPrice : sellStopLimitPrice}
          setLimitPrice={isBuy ? setBuyStopLimitPrice : setSellStopLimitPrice}
        />
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