'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface Coin {
  value: string;
  label: string;
  icon: React.ReactNode;
  popoverIcon: React.ReactNode;
}

interface OrderFormSelection {
  side: 'buy' | 'sell';
  price: string;
  token: number;
  mode: 'limit' | 'market';
}

interface OrderBookSelectionPayload {
  side: 'buy' | 'sell';
  price: number | string | null | undefined;
  fallbackPrice?: number | string | null;
}

// Add proper types for Binance API responses
interface BinancePriceFilter {
  filterType: string;
  tickSize?: string;
}

interface BinanceSymbolInfo {
  symbol: string;
  filters?: BinancePriceFilter[];
}

interface BinanceExchangeInfo {
  symbols?: BinanceSymbolInfo[];
}

interface CoinContextType {
  selectedCoin: Coin;
  setSelectedCoin: (coin: Coin) => void;
  marketPrice: string;
  chartPrice: string;
  isPriceLoading: boolean;
  priceDecimalPlaces: number;
  ordersVersion: number;
  refreshOrders: () => void;
  activeOrderTab: 'buy' | 'sell';
  setActiveOrderTab: (tab: 'buy' | 'sell') => void;
  orderFormSelection: OrderFormSelection | null;
  applyOrderBookSelection: (payload: OrderBookSelectionPayload) => void;
  updateChartPrice: (price: number | string | null | undefined) => void;
}

const CoinContext = createContext<CoinContextType | undefined>(undefined);

const defaultCoin: Coin = {
  value: 'BINANCE:BTCUSDT',
  label: 'BTC/USDT',
  icon: (
    <Image
      src="/currency-icons/bitcoin-icon.svg"
      alt="Bitcoin"
      width={28}
      height={28}
      className="rounded-full"
    />
  ),
  popoverIcon: (
    <Image
      src="/currency-icons/bitcoin-icon.svg"
      alt="Bitcoin"
      width={20}
      height={20}
      className="rounded-full"
    />
  ),
};

export const CoinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCoin, setSelectedCoinState] = useState<Coin>(defaultCoin);
  const [marketPrice, setMarketPrice] = useState<string>('');
  const [chartPrice, setChartPrice] = useState<string>('');
  const [isPriceLoading, setIsPriceLoading] = useState<boolean>(true);
  const [priceDecimalPlaces, setPriceDecimalPlaces] = useState<number>(2);
  const [ordersVersion, setOrdersVersion] = useState<number>(0);
  const [activeOrderTab, setActiveOrderTabState] = useState<'buy' | 'sell'>('buy');
  const [orderFormSelection, setOrderFormSelection] = useState<OrderFormSelection | null>(null);
  const { data: session, status } = useSession();

  // real-time infra
  const currentSymbolRef = React.useRef<string>('');
  const priceCache = React.useRef<{ [key: string]: string }>({});
  const precisionCache = React.useRef<{ [key: string]: number }>({});
  const wsRef = React.useRef<WebSocket | null>(null);
  const reconnectTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const staleCheckRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdateRef = React.useRef<number>(0);
  const closedRef = React.useRef<boolean>(false);
  const reconnectAttemptsRef = React.useRef<number>(0);

  // Hydrate caches from localStorage once (persist across page switches)
  useEffect(() => {
    try {
      const savedPrices = localStorage.getItem('wl_priceCache');
      const savedPrecisions = localStorage.getItem('wl_precisionCache');
      if (savedPrices) {
        const obj = JSON.parse(savedPrices);
        if (obj && typeof obj === 'object') priceCache.current = obj;
      }
      if (savedPrecisions) {
        const obj = JSON.parse(savedPrecisions);
        if (obj && typeof obj === 'object') precisionCache.current = obj;
      }
    } catch {
      // Silently handle parsing errors
    }
  }, []);

  // Load coin from storage depending on session
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        if (status === 'unauthenticated' || !session) {
          setSelectedCoinState(defaultCoin);
          localStorage.removeItem('selectedCoin');
          return;
        }
        if (status === 'authenticated') {
          const stored = localStorage.getItem('selectedCoin');
          if (stored) {
            const storedData = JSON.parse(stored);
            if (storedData.symbol) {
              const coinObject = createCoinObject(storedData.symbol);
              setSelectedCoinState(coinObject);
            } else {
              setSelectedCoinState(defaultCoin);
            }
          } else {
            setSelectedCoinState(defaultCoin);
          }
        }
      } catch {
        setSelectedCoinState(defaultCoin);
      }
    };
    if (status !== 'loading') {
      loadFromStorage();
    }
  }, [session, status]);

  // Setter + storage + bump version
  const setSelectedCoin = useCallback(
    (coin: Coin) => {
      try {
        setSelectedCoinState(coin);
        setOrdersVersion((v) => v + 1);
        setActiveOrderTabState('buy');
        setOrderFormSelection(null);
        if (session) {
          const symbol = coin.value.replace('BINANCE:', '').replace('USDT', '');
          localStorage.setItem(
            'selectedCoin',
            JSON.stringify({ value: coin.value, label: coin.label, symbol })
          );
        }
      } catch {
        // Silently handle storage errors
      }
    },
    [session]
  );

  const refreshOrders = useCallback(() => setOrdersVersion((v) => v + 1), []);
  const formatOriginalPrice = useCallback((value: number, places: number): string => {
    if (isNaN(value) || value <= 0) return '0.' + '0'.repeat(places);
    const formattedValue = value.toFixed(places);
    const [integerPart, decimalPart] = formattedValue.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${formattedInteger}.${decimalPart || '0'.repeat(places)}`;
  }, []);

  const updateChartPrice = useCallback(
    (value: number | string | null | undefined) => {
      if (value === null || value === undefined) {
        setChartPrice('');
        return;
      }

      let numeric: number | null = null;

      if (typeof value === 'number') {
        numeric = Number.isFinite(value) ? value : null;
      } else if (typeof value === 'string') {
        const sanitized = value.replace(/,/g, '');
        const parsed = Number.parseFloat(sanitized);
        numeric = Number.isFinite(parsed) ? parsed : null;
      }

      if (numeric === null || numeric <= 0) {
        return;
      }

      const formatted = formatOriginalPrice(numeric, priceDecimalPlaces);
      setChartPrice(formatted);
      setIsPriceLoading(false);
    },
    [formatOriginalPrice, priceDecimalPlaces]
  );

  const setActiveOrderTab = useCallback((tab: 'buy' | 'sell') => {
    setActiveOrderTabState(tab);
  }, []);

  const applyOrderBookSelection = useCallback(
    ({ side, price, fallbackPrice }: OrderBookSelectionPayload) => {
      if (side !== 'buy' && side !== 'sell') return;

      const parseNumeric = (value: number | string | null | undefined) => {
        if (value === null || value === undefined) return NaN;
        if (typeof value === 'string') {
          const sanitized = String(value).replace(/[^0-9.]/g, '');
          return sanitized ? Number(sanitized) : NaN;
        }
        return Number(value);
      };

      let numeric = parseNumeric(price);
      let mode: 'limit' | 'market' = 'limit';

      if (!Number.isFinite(numeric) || numeric <= 0) {
        numeric = parseNumeric(fallbackPrice);
        mode = 'market';
      }

      if (!Number.isFinite(numeric) || numeric <= 0) return;

      const formattedPrice = formatOriginalPrice(numeric, priceDecimalPlaces);
      setOrderFormSelection({
        side,
        price: formattedPrice,
        token: Date.now(),
        mode,
      });
      setActiveOrderTab(side);
    },
    [formatOriginalPrice, priceDecimalPlaces, setActiveOrderTab]
  );

  // Real-time price per selected coin with reconnection + stale HTTP fallback
  useEffect(() => {
    const symbolLabel = selectedCoin.label; // e.g., BTC/USDT
    currentSymbolRef.current = symbolLabel;
    setMarketPrice('');
    setChartPrice('');
    setIsPriceLoading(true);

    // cleanup previous resources
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (staleCheckRef.current) {
      clearInterval(staleCheckRef.current);
      staleCheckRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // Silently handle close errors
      }
      wsRef.current = null;
    }
    closedRef.current = false;
    reconnectAttemptsRef.current = 0;
    lastUpdateRef.current = 0;

    // Serve cached immediately for snappy UI
    if (priceCache.current[symbolLabel] && precisionCache.current[symbolLabel] != null) {
      setPriceDecimalPlaces(precisionCache.current[symbolLabel]);
      setMarketPrice(priceCache.current[symbolLabel]);
      setIsPriceLoading(false);
    }

    const coinSymbol = symbolLabel.split('/')[0]?.toUpperCase();
    if (!coinSymbol) {
      setIsPriceLoading(false);
      return;
    }

    const fetchPrecision = async () => {
      try {
        const apiSymbol = `${coinSymbol}USDT`;
        const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
        const data: BinanceExchangeInfo = await response.json();
        const symInfo = data.symbols?.find((s: BinanceSymbolInfo) => s.symbol === apiSymbol);
        const priceFilter = symInfo?.filters?.find(
          (f: BinancePriceFilter) => f.filterType === 'PRICE_FILTER'
        );
        const tickSize = parseFloat(priceFilter?.tickSize ?? '0');
        if (!isNaN(tickSize) && tickSize > 0) {
          const places = Math.max(0, Math.round(-Math.log10(tickSize)));
          precisionCache.current[symbolLabel] = places;
          setPriceDecimalPlaces(places);
          try {
            localStorage.setItem('wl_precisionCache', JSON.stringify(precisionCache.current));
          } catch {
            // Silently handle storage errors
          }
        } else {
          setPriceDecimalPlaces(2);
        }
      } catch {
        setPriceDecimalPlaces(2);
      }
    };

    const connectWs = () => {
      const wsStream = `${coinSymbol.toLowerCase()}usdt@trade`;
      let ws: WebSocket | null = null;
      try {
        ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsStream}`);
        wsRef.current = ws;
      } catch {
        wsRef.current = null;
      }
      if (!ws) return;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const priceValue = parseFloat(data.p);
          if (!isNaN(priceValue) && priceValue > 0) {
            if (currentSymbolRef.current === symbolLabel) {
              const places = precisionCache.current[symbolLabel] ?? priceDecimalPlaces;
              const price = formatOriginalPrice(priceValue, places);
              priceCache.current[symbolLabel] = price;
              setMarketPrice(price);
              setIsPriceLoading(false);
              lastUpdateRef.current = Date.now();
              try {
                localStorage.setItem('wl_priceCache', JSON.stringify(priceCache.current));
              } catch {
                // Silently handle storage errors
              }
            }
          }
        } catch {
          setIsPriceLoading(false);
        }
      };
      ws.onerror = () => {
        // onclose will handle reconnect
      };
      ws.onclose = () => {
        if (closedRef.current) return;
        const attempt = Math.min(reconnectAttemptsRef.current + 1, 10);
        reconnectAttemptsRef.current = attempt;
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        reconnectTimerRef.current = setTimeout(() => {
          if (currentSymbolRef.current === symbolLabel && !closedRef.current) {
            connectWs();
          }
        }, delay);
      };
    };

    const startStaleCheck = () => {
      staleCheckRef.current = setInterval(async () => {
        if (currentSymbolRef.current !== symbolLabel) return;
        const now = Date.now();
        const age = now - (lastUpdateRef.current || 0);
        if (age > 5000) {
          try {
            const response = await fetch(
              `https://api.binance.com/api/v3/ticker/price?symbol=${coinSymbol}USDT`
            );
            const data = await response.json();
            const priceValue = parseFloat(data.price);
            if (!isNaN(priceValue) && priceValue > 0) {
              const places = precisionCache.current[symbolLabel] ?? priceDecimalPlaces;
              const price = formatOriginalPrice(priceValue, places);
              priceCache.current[symbolLabel] = price;
              setMarketPrice(price);
              setIsPriceLoading(false);
              lastUpdateRef.current = Date.now();
              try {
                localStorage.setItem('wl_priceCache', JSON.stringify(priceCache.current));
              } catch {
                // Silently handle storage errors
              }
            }
          } catch {
            // Silently handle fetch errors
          }
        }
      }, 3000);
    };

    fetchPrecision();
    connectWs();
    startStaleCheck();

    return () => {
      closedRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (staleCheckRef.current) {
        clearInterval(staleCheckRef.current);
        staleCheckRef.current = null;
      }
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          // Silently handle close errors
        }
        wsRef.current = null;
      }
    };
  }, [selectedCoin.label, formatOriginalPrice, priceDecimalPlaces]);

  return (
    <CoinContext.Provider
      value={{
        selectedCoin,
        setSelectedCoin,
        marketPrice,
        chartPrice,
        isPriceLoading,
        priceDecimalPlaces,
        ordersVersion,
        refreshOrders,
        activeOrderTab,
        setActiveOrderTab,
        orderFormSelection,
        applyOrderBookSelection,
        updateChartPrice,
      }}
    >
      {children}
    </CoinContext.Provider>
  );
};

// Helper to build coin object
export const createCoinObject = (symbol: string): Coin => {
  const upperSymbol = symbol.toUpperCase();

  const getIcon = (sym: string, size: number = 28) => {
    const iconProps = { width: size, height: size, className: 'rounded-full' } as const;
    switch (sym) {
      case 'BTC':
        return <Image src="/currency-icons/bitcoin-icon.svg" alt="Bitcoin" {...iconProps} />;
      case 'ETH':
        return <Image src="/currency-icons/ethereum-icon.svg" alt="Ethereum" {...iconProps} />;
      case 'BNB':
        return <Image src="/currency-icons/bnb-coin.svg" alt="BNB" {...iconProps} />;
      case 'SOL':
        return <Image src="/currency-icons/solana-icon.svg" alt="Solana" {...iconProps} />;
      case 'XRP':
        return <Image src="/currency-icons/xrp-coin.svg" alt="XRP" {...iconProps} />;
      case 'ADA':
        return <Image src="/currency-icons/ada-coin.svg" alt="Cardano" {...iconProps} />;
      case 'DOGE':
        return <Image src="/currency-icons/doge-coin.svg" alt="Dogecoin" {...iconProps} />;
      default:
        return <Image src="/currency-icons/default-coin.svg" alt="Default Coin" {...iconProps} />;
    }
  };

  return {
    value: `BINANCE:${upperSymbol}USDT`,
    label: `${upperSymbol}/USDT`,
    icon: getIcon(upperSymbol, 28),
    popoverIcon: getIcon(upperSymbol, 20),
  };
};

export const useCoinContext = () => {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error('useCoinContext must be used within a CoinProvider');
  }
  return context;
};
