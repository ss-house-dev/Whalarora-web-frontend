import { useState, useEffect, useRef, useCallback } from 'react';

interface PriceFilter {
  filterType: string;
  tickSize: string;
}

interface SymbolInfo {
  symbol: string;
  filters: PriceFilter[];
}

interface ExchangeInfoResponse {
  symbols: SymbolInfo[];
}

interface UseMarketPriceOptions {
  throttleMs?: number;
}
type TimeoutHandle = ReturnType<typeof setTimeout>;


export function useMarketPrice(symbol: string, options?: UseMarketPriceOptions) {
  const throttleMs = Math.max(0, options?.throttleMs ?? 0);
  const [marketPrice, setMarketPrice] = useState<string>('');
  const [isPriceLoading, setIsPriceLoading] = useState<boolean>(true);
  const [priceDecimalPlaces, setPriceDecimalPlaces] = useState<number>(2);
  const [numericPrice, setNumericPrice] = useState<number | null>(null);
  const currentSymbolRef = useRef<string>('');
  const priceCache = useRef<{ [key: string]: string }>({});
  const numericCache = useRef<{ [key: string]: number }>({});
  const precisionCache = useRef<{ [key: string]: number }>({});
  const throttleTimerRef = useRef<TimeoutHandle | null>(null);
  const pendingPriceRef = useRef<{ value: number; places?: number } | null>(null);
  const lastEmitRef = useRef<number>(0);

  const formatOriginalPrice = useCallback(
    (value: number, overridePlaces?: number): string => {
      const basePlaces = Math.max(0, priceDecimalPlaces);
      const override = overridePlaces !== undefined ? Math.max(0, overridePlaces) : undefined;
      const places = Math.min(8, override !== undefined ? Math.max(basePlaces, override) : basePlaces);

      if (isNaN(value) || value <= 0) {
        return `0.${'0'.repeat(places)}`;
      }

      const formattedValue = value.toFixed(places);
      const [integerPart, decimalPart = ''] = formattedValue.split('.');
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
    },
    [priceDecimalPlaces]
  );

  useEffect(() => {
    if (!symbol) {
      currentSymbolRef.current = '';
      setMarketPrice('');
      setNumericPrice(null);
      setIsPriceLoading(false);
      return;
    }

    console.log(`useMarketPrice: Symbol changed to ${symbol}`);
    currentSymbolRef.current = symbol;

    pendingPriceRef.current = null;
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
    lastEmitRef.current = 0;

    setIsPriceLoading(true);

    const cachedPrice = priceCache.current[symbol];
    const cachedNumeric = numericCache.current[symbol];
    const cachedPrecision = precisionCache.current[symbol];

    if (typeof cachedPrecision === 'number') {
      setPriceDecimalPlaces(cachedPrecision);
    }

    if (cachedPrice) {
      setMarketPrice(cachedPrice);
      if (typeof cachedNumeric === 'number' && Number.isFinite(cachedNumeric)) {
        setNumericPrice(cachedNumeric);
      } else {
        const parsedCached = Number.parseFloat(cachedPrice.replace(/,/g, ''));
        setNumericPrice(Number.isFinite(parsedCached) ? parsedCached : null);
      }
      setIsPriceLoading(false);
    } else {
      setMarketPrice('');
      setNumericPrice(null);
    }

    const coinSymbol = symbol.split('/')[0]?.toUpperCase();
    if (!coinSymbol) {
      console.warn('useMarketPrice: Invalid symbol, stopping WebSocket');
      setIsPriceLoading(false);
      return;
    }

    let isActive = true;

    const emitNow = (priceValue: number, formatted: string) => {
      if (!isActive || currentSymbolRef.current !== symbol) return;
      priceCache.current[symbol] = formatted;
      numericCache.current[symbol] = priceValue;
      setNumericPrice(priceValue);
      setMarketPrice(formatted);
    };

    const schedulePrice = (priceValue: number, fallbackPlaces?: number, immediate = false) => {
      if (!isActive) return;

      const decimalsHint = fallbackPlaces !== undefined ? Math.max(0, fallbackPlaces) : undefined;
      const formatted = formatOriginalPrice(priceValue, decimalsHint);

      if (immediate || throttleMs <= 0) {
        lastEmitRef.current = Date.now();
        pendingPriceRef.current = null;
        emitNow(priceValue, formatted);
        setIsPriceLoading(false);
        return;
      }

      const now = Date.now();
      const elapsed = now - lastEmitRef.current;

      if (elapsed >= throttleMs) {
        lastEmitRef.current = now;
        pendingPriceRef.current = null;
        emitNow(priceValue, formatted);
        setIsPriceLoading(false);
        return;
      }

      pendingPriceRef.current = { value: priceValue, places: decimalsHint };
      setIsPriceLoading(false);

      if (throttleTimerRef.current != null) {
        return;
      }

      const delay = Math.max(0, throttleMs - elapsed);

      throttleTimerRef.current = setTimeout(() => {
        throttleTimerRef.current = null;
        if (!isActive || currentSymbolRef.current !== symbol) {
          pendingPriceRef.current = null;
          return;
        }

        const pending = pendingPriceRef.current;
        if (pending) {
          lastEmitRef.current = Date.now();
          const pendingFormatted = formatOriginalPrice(pending.value, pending.places);
          emitNow(pending.value, pendingFormatted);
          pendingPriceRef.current = null;
          setIsPriceLoading(false);
        }
      }, delay);
    };

    const fetchPrecision = async () => {
      try {
        const apiSymbol = `${coinSymbol}USDT`;
        const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
        const data: ExchangeInfoResponse = await response.json();
        const symInfo = data.symbols.find((s: SymbolInfo) => s.symbol === apiSymbol);

        if (symInfo) {
          const priceFilter = symInfo.filters.find((f: PriceFilter) => f.filterType === 'PRICE_FILTER');
          if (priceFilter && priceFilter.tickSize) {
            const tickSize = parseFloat(priceFilter.tickSize);
            if (!Number.isNaN(tickSize) && tickSize > 0) {
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
        const priceValue = Number.parseFloat(data.p);
        if (Number.isNaN(priceValue) || priceValue <= 0) {
          console.warn(`useMarketPrice: Invalid or zero price received: ${data.p}`);
          return;
        }
        if (currentSymbolRef.current === symbol) {
          const decimalsHint =
            typeof data.p === 'string' && data.p.includes('.')
              ? Math.min(8, Math.max(0, (data.p.split('.')[1] ?? '').length))
              : undefined;
          schedulePrice(priceValue, decimalsHint);
          console.log(`useMarketPrice: Price updated for ${coinSymbol}: ${priceValue}`);
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

    ws.onerror = () => {
      setIsPriceLoading(false);
    };

    let fallbackTimeout: TimeoutHandle | null = null;

    fallbackTimeout = setTimeout(async () => {
      const currentMarketPrice = priceCache.current[symbol];
      if (!currentMarketPrice && currentSymbolRef.current === symbol) {
        console.log(`useMarketPrice: WebSocket timeout, using HTTP fallback for ${coinSymbol}`);
        try {
          const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coinSymbol}USDT`);
          const data = await response.json();
          if (currentSymbolRef.current === symbol) {
            const priceValue = Number.parseFloat(data.price);
            if (Number.isNaN(priceValue) || priceValue <= 0) {
              console.warn(`useMarketPrice: Invalid HTTP price for ${coinSymbol}: ${data.price}`);
              return;
            }
            const decimalsHint =
              typeof data.price === 'string' && data.price.includes('.')
                ? Math.min(8, Math.max(0, (data.price.split('.')[1] ?? '').length))
                : undefined;
            schedulePrice(priceValue, decimalsHint);
            console.log(`useMarketPrice: Fallback HTTP price for ${coinSymbol}: ${priceValue}`);
          }
        } catch (error) {
          console.error('useMarketPrice: HTTP API fallback error:', error);
          setIsPriceLoading(false);
        }
      }
    }, 3000);

    return () => {
      console.log(`useMarketPrice: Cleaning up WebSocket for ${wsStream}`);
      isActive = false;
      pendingPriceRef.current = null;
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
      ws.close();
    };
  }, [symbol, formatOriginalPrice, throttleMs]);

  return { marketPrice, isPriceLoading, priceDecimalPlaces, numericPrice };
}


