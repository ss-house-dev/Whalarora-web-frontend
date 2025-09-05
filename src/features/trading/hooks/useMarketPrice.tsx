import { useState, useEffect, useRef, useCallback } from "react";

export function useMarketPrice(symbol: string) {
  const [marketPrice, setMarketPrice] = useState<string>("");
  const [isPriceLoading, setIsPriceLoading] = useState<boolean>(true);
  const currentSymbolRef = useRef<string>("");
  const priceCache = useRef<{ [key: string]: string }>({});

  // ฟังก์ชันสำหรับตัดทิ้งตัวเลขทศนิยมเกิน 2 ตำแหน่งและเพิ่ม comma
  const truncateToTwoDecimalsWithComma = useCallback((value: number): string => {
    if (isNaN(value)) return "0.00";
    const factor = Math.pow(10, 2);
    const truncated = Math.floor(value * factor) / factor;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(truncated);
  }, []);

  useEffect(() => {
    console.log(`useMarketPrice: Symbol changed to ${symbol}`);
    currentSymbolRef.current = symbol;

    setMarketPrice("");
    setIsPriceLoading(true);

    if (priceCache.current[symbol]) {
      console.log(`useMarketPrice: Using cached price for ${symbol}: ${priceCache.current[symbol]}`);
      setMarketPrice(priceCache.current[symbol]);
      setIsPriceLoading(false);
    }

    const coinSymbol = symbol.split("/")[0]?.toLowerCase();
    if (!coinSymbol) {
      console.warn("useMarketPrice: Invalid symbol, stopping WebSocket");
      setIsPriceLoading(false);
      return;
    }

    const wsStream = `${coinSymbol}usdt@trade`;
    console.log(`useMarketPrice: Connecting to WebSocket ${wsStream}`);
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsStream}`);

    ws.onopen = () => {
      console.log(`useMarketPrice: WebSocket opened for ${wsStream}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (currentSymbolRef.current === symbol) {
          const price = truncateToTwoDecimalsWithComma(parseFloat(data.p));
          priceCache.current[symbol] = price;
          setMarketPrice(price);
          setIsPriceLoading(false);
          console.log(`useMarketPrice: Price updated for ${coinSymbol}: ${price}`);
        } else {
          console.warn(`useMarketPrice: Ignored price update for ${coinSymbol}, current symbol is ${currentSymbolRef.current}`);
        }
      } catch (error) {
        console.error("useMarketPrice: WebSocket message error:", error);
        setIsPriceLoading(false);
      }
    };

    // Use refs to access current state values without adding them as dependencies
    const fallbackTimeout = setTimeout(async () => {
      // Access current values through refs or by checking cache
      const currentMarketPrice = priceCache.current[symbol];
      if (!currentMarketPrice && currentSymbolRef.current === symbol) {
        console.log(`useMarketPrice: WebSocket timeout, using HTTP fallback for ${coinSymbol}`);
        try {
          const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${coinSymbol.toUpperCase()}USDT`
          );
          const data = await response.json();
          if (currentSymbolRef.current === symbol) {
            const price = truncateToTwoDecimalsWithComma(parseFloat(data.price));
            priceCache.current[symbol] = price;
            setMarketPrice(price);
            setIsPriceLoading(false);
            console.log(`useMarketPrice: Fallback HTTP price for ${coinSymbol}: ${price}`);
          }
        } catch (error) {
          console.error("useMarketPrice: HTTP API fallback error:", error);
          setIsPriceLoading(false);
        }
      }
    }, 1000);

    return () => {
      console.log(`useMarketPrice: Cleaning up WebSocket for ${wsStream}`);
      clearTimeout(fallbackTimeout);
      ws.close();
    };
  }, [symbol, truncateToTwoDecimalsWithComma]);

  return { marketPrice, isPriceLoading };
}