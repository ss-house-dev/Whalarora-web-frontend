import { useState, useEffect, useRef, useCallback } from 'react';

export function useMarketPrice(symbol: string) {
  const [marketPrice, setMarketPrice] = useState<string>('');
  const [isPriceLoading, setIsPriceLoading] = useState<boolean>(true);
  const currentSymbolRef = useRef<string>('');
  const priceCache = useRef<{ [key: string]: string }>({});

  // ฟังก์ชันสำหรับจัดรูปแบบราคาแบบ original โดยเพิ่ม comma และรักษาทศนิยม
  const formatOriginalPrice = useCallback((value: number): string => {
    if (isNaN(value)) return '0.00';

    // Convert to string with full precision
    const valueStr = value.toFixed(8); // Use fixed precision (e.g., 8 decimals) for crypto prices
    const decimalIndex = valueStr.indexOf('.');

    // If it's an integer, append .00
    if (decimalIndex === -1) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }

    // Count actual decimal places, excluding trailing zeros
    const decimalPart = valueStr.split('.')[1].replace(/0+$/, '');
    const decimalPlaces = decimalPart.length;

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: Math.max(2, decimalPlaces),
      maximumFractionDigits: Math.max(2, decimalPlaces),
    }).format(value);
  }, []);

  useEffect(() => {
    console.log(`useMarketPrice: Symbol changed to ${symbol}`);
    currentSymbolRef.current = symbol;

    setMarketPrice('');
    setIsPriceLoading(true);

    if (priceCache.current[symbol]) {
      console.log(
        `useMarketPrice: Using cached price for ${symbol}: ${priceCache.current[symbol]}`
      );
      setMarketPrice(priceCache.current[symbol]);
      setIsPriceLoading(false);
    }

    const coinSymbol = symbol.split('/')[0]?.toLowerCase();
    if (!coinSymbol) {
      console.warn('useMarketPrice: Invalid symbol, stopping WebSocket');
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
        console.log(`Raw WebSocket data.p for ${coinSymbol}:`, data.p);
        const priceValue = parseFloat(data.p);
        if (isNaN(priceValue) || priceValue <= 0) {
          console.warn(`useMarketPrice: Invalid or zero price received: ${data.p}`);
          return; // Skip invalid prices
        }
        if (currentSymbolRef.current === symbol) {
          const price = formatOriginalPrice(priceValue);
          priceCache.current[symbol] = price;
          setMarketPrice(price);
          setIsPriceLoading(false);
          console.log(`useMarketPrice: Price updated for ${coinSymbol}: ${price}`);
        } else {
          console.warn(
            `useMarketPrice: Ignored price update for ${coinSymbol}, current symbol is ${currentSymbolRef.current}`
          );
        }
      } catch (error) {
        console.error('useMarketPrice: WebSocket message error:', error);
        setIsPriceLoading(false);
      }
    };

    // Use refs to access current state values without adding them as dependencies
    const fallbackTimeout = setTimeout(async () => {
      const currentMarketPrice = priceCache.current[symbol];
      if (!currentMarketPrice && currentSymbolRef.current === symbol) {
        console.log(`useMarketPrice: WebSocket timeout, using HTTP fallback for ${coinSymbol}`);
        try {
          const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${coinSymbol.toUpperCase()}USDT`
          );
          const data = await response.json();
          if (currentSymbolRef.current === symbol) {
            const priceValue = parseFloat(data.price);
            if (isNaN(priceValue) || priceValue <= 0) {
              console.warn(`useMarketPrice: Invalid HTTP price for ${coinSymbol}: ${data.price}`);
              return;
            }
            const price = formatOriginalPrice(priceValue);
            priceCache.current[symbol] = price;
            setMarketPrice(price);
            setIsPriceLoading(false);
            console.log(`useMarketPrice: Fallback HTTP price for ${coinSymbol}: ${price}`);
          }
        } catch (error) {
          console.error('useMarketPrice: HTTP API fallback error:', error);
          setIsPriceLoading(false);
        }
      }
    }, 3000); // Increase timeout to 3 seconds to give WebSocket more time

    return () => {
      console.log(`useMarketPrice: Cleaning up WebSocket for ${wsStream}`);
      clearTimeout(fallbackTimeout);
      ws.close();
    };
  }, [symbol, formatOriginalPrice]);

  return { marketPrice, isPriceLoading };
}
