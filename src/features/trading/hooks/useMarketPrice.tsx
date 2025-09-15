import { useState, useEffect, useRef, useCallback } from 'react';

export function useMarketPrice(symbol: string) {
  const [marketPrice, setMarketPrice] = useState<string>('');
  const [isPriceLoading, setIsPriceLoading] = useState<boolean>(true);
  const [priceDecimalPlaces, setPriceDecimalPlaces] = useState<number>(2);
  const currentSymbolRef = useRef<string>('');
  const priceCache = useRef<{ [key: string]: string }>({});
  const precisionCache = useRef<{ [key: string]: number }>({});

  const formatOriginalPrice = useCallback(
    (value: number): string => {
      if (isNaN(value) || value <= 0) return '0.' + '0'.repeat(priceDecimalPlaces);

      const formattedValue = value.toFixed(priceDecimalPlaces);
      const [integerPart, decimalPart] = formattedValue.split('.');
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${formattedInteger}.${decimalPart || '0'.repeat(priceDecimalPlaces)}`;
    },
    [priceDecimalPlaces]
  );

  useEffect(() => {
    console.log(`useMarketPrice: Symbol changed to ${symbol}`);
    currentSymbolRef.current = symbol;

    setMarketPrice('');
    setIsPriceLoading(true);

    if (priceCache.current[symbol] && precisionCache.current[symbol]) {
      console.log(
        `useMarketPrice: Using cached price for ${symbol}: ${priceCache.current[symbol]}`
      );
      setPriceDecimalPlaces(precisionCache.current[symbol]);
      setMarketPrice(priceCache.current[symbol]);
      setIsPriceLoading(false);
      return;
    }

    const coinSymbol = symbol.split('/')[0]?.toUpperCase();
    if (!coinSymbol) {
      console.warn('useMarketPrice: Invalid symbol, stopping WebSocket');
      setIsPriceLoading(false);
      return;
    }

    const fetchPrecision = async () => {
      try {
        const apiSymbol = `${coinSymbol}USDT`;
        const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
        const data = await response.json();
        const symInfo = data.symbols.find((s: any) => s.symbol === apiSymbol);

        if (symInfo) {
          const priceFilter = symInfo.filters.find((f: any) => f.filterType === 'PRICE_FILTER');
          if (priceFilter && priceFilter.tickSize) {
            const tickSize = parseFloat(priceFilter.tickSize);
            if (!isNaN(tickSize) && tickSize > 0) {
              const places = Math.max(0, Math.round(-Math.log10(tickSize)));
              precisionCache.current[symbol] = places;
              setPriceDecimalPlaces(places);
              console.log(`useMarketPrice: Set decimal places for ${symbol} to ${places}`);
            } else {
              console.warn(`useMarketPrice: Invalid tickSize for ${symbol}`);
            }
          } else {
            console.warn(`useMarketPrice: No PRICE_FILTER found for ${symbol}`);
          }
        } else {
          console.warn(`useMarketPrice: Symbol ${apiSymbol} not found in exchangeInfo`);
        }
      } catch (error) {
        console.error('useMarketPrice: Error fetching exchangeInfo:', error);
        setPriceDecimalPlaces(2);
      }
    };

    fetchPrecision();

    const wsStream = `${coinSymbol.toLowerCase()}usdt@trade`;
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
          return;
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

    const fallbackTimeout = setTimeout(async () => {
      const currentMarketPrice = priceCache.current[symbol];
      if (!currentMarketPrice && currentSymbolRef.current === symbol) {
        console.log(`useMarketPrice: WebSocket timeout, using HTTP fallback for ${coinSymbol}`);
        try {
          const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${coinSymbol}USDT`
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
    }, 3000);

    return () => {
      console.log(`useMarketPrice: Cleaning up WebSocket for ${wsStream}`);
      clearTimeout(fallbackTimeout);
      ws.close();
    };
  }, [symbol, formatOriginalPrice]);

  return { marketPrice, isPriceLoading, priceDecimalPlaces };
}
