import { useState, useEffect, useRef } from "react";

export function useMarketPrice(symbol: string) {
  const [marketPrice, setMarketPrice] = useState<string>("");
  const [isPriceLoading, setIsPriceLoading] = useState<boolean>(true);
  const currentSymbolRef = useRef<string>("");
  const priceCache = useRef<{ [key: string]: string }>({});

  useEffect(() => {
    console.log(`useMarketPrice: Symbol changed to ${symbol}`);
    // อัปเดต currentSymbolRef เพื่อใช้กรองข้อมูล WebSocket
    currentSymbolRef.current = symbol;

    // รีเซ็ต marketPrice และตั้ง isPriceLoading
    setMarketPrice("");
    setIsPriceLoading(true);

    // ใช้ราคาจาก cache ถ้ามี
    if (priceCache.current[symbol]) {
      console.log(`useMarketPrice: Using cached price for ${symbol}: ${priceCache.current[symbol]}`);
      setMarketPrice(priceCache.current[symbol]);
      setIsPriceLoading(false);
    }

    // แปลง symbol (เช่น BTC/USDT) เป็นรูปแบบ WebSocket (เช่น btcusdt)
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
        // ตรวจสอบว่า symbol ยังตรงกับ currentSymbolRef
        if (currentSymbolRef.current === symbol) {
          const price = parseFloat(data.p).toFixed(2);
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
    
    // Fallback ไปยัง HTTP API หาก WebSocket ไม่ส่งข้อมูลภายใน 1 วินาที
    const fallbackTimeout = setTimeout(async () => {
      if (!marketPrice && isPriceLoading && currentSymbolRef.current === symbol) {
        console.log(`useMarketPrice: WebSocket timeout, using HTTP fallback for ${coinSymbol}`);
        try {
          const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${coinSymbol.toUpperCase()}USDT`
          );
          const data = await response.json();
          const price = parseFloat(data.price).toFixed(2);
          if (currentSymbolRef.current === symbol) {
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

    // Cleanup WebSocket และ timeout
    return () => {
      console.log(`useMarketPrice: Cleaning up WebSocket for ${wsStream}`);
      ws.close();
      clearTimeout(fallbackTimeout);
    };
  }, [symbol]);

  return { marketPrice, isPriceLoading };
}