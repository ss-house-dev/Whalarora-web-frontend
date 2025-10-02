import { useState, useEffect } from 'react';

interface TickerPrice {
  symbol: string;
  price: string;
}

export function useAllMarketPrices(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (symbols.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchPrices = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price');
        const data: TickerPrice[] = await response.json();

        const priceMap: Record<string, string> = {};
        const symbolSet = new Set(symbols.map((s) => `${s.toUpperCase()}USDT`));

        for (const ticker of data) {
          if (symbolSet.has(ticker.symbol)) {
            const originalSymbol = ticker.symbol.replace('USDT', '');
            priceMap[originalSymbol] = ticker.price;
          }
        }

        setPrices(priceMap);
      } catch (error) {
        console.error('Error fetching all market prices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();

    const interval = setInterval(fetchPrices, 5000); // Refetch every 5 seconds

    return () => clearInterval(interval);
  }, [symbols]);

  return { prices, isLoading };
}
