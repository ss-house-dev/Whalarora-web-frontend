'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { useGetAllAssets } from '@/features/assets/hooks/useGetAllAssets';
import {
  fetchCoinMetadata,
  getFallbackMetadata,
  getFallbackName,
  normalizeNumber,
  type CoinMetadata,
} from '@/features/assets/utils/coinMetadata';
import { useMarketPrice } from '@/features/trading/hooks/useMarketPrice';
import type { AllocationSlice, AssetValuation } from '../types';

const getUpperSymbol = (symbol: string | undefined | null) => {
  if (!symbol) return '';
  return symbol.trim().toUpperCase();
};

type RealtimeState = {
  price: number | null;
  isLoading: boolean;
};

type RealtimeUpdate = {
  price: number | null;
  isLoading: boolean;
};

const selectBestPrice = (
  symbol: string,
  asset: { currentPrice?: number; avgPrice: number },
  metadata: Record<string, CoinMetadata>,
  realtime: Record<string, RealtimeState>
) => {
  const upperSymbol = getUpperSymbol(symbol);
  const realTimePrice = normalizeNumber(realtime[upperSymbol]?.price);
  const metadataPrice = normalizeNumber(metadata[upperSymbol]?.price);
  const apiPrice = normalizeNumber(asset.currentPrice);
  const averageCost = normalizeNumber(asset.avgPrice);

  if (realTimePrice > 0) return realTimePrice;
  if (metadataPrice > 0) return metadataPrice;
  if (apiPrice > 0) return apiPrice;
  if (averageCost > 0) return averageCost;
  return 0;
};

const ensureFiniteNumber = (value: number) => (Number.isFinite(value) ? value : 0);

const DEFAULT_ICON = '/currency-icons/default-coin.svg';
const ICON_MAP: Record<string, string> = {
  BTC: '/currency-icons/bitcoin-icon.svg',
  ETH: '/currency-icons/ethereum-icon.svg',
  BNB: '/currency-icons/bnb-coin.svg',
  SOL: '/currency-icons/solana-icon.svg',
  USDT: '/currency-icons/dollar-icon.svg',
  USDC: '/currency-icons/dollar-icon.svg',
  XRP: '/currency-icons/xrp-coin.svg',
  DOGE: '/currency-icons/doge-coin.svg',
  ADA: '/currency-icons/ada-coin.svg',
};

const getAssetIconPath = (symbol: string) => {
  const upper = getUpperSymbol(symbol);
  if (!upper) return DEFAULT_ICON;
  return ICON_MAP[upper] ?? DEFAULT_ICON;
};

const calculateAssetValuation = (
  asset: {
    _id: string;
    symbol: string;
    amount: number;
    avgPrice: number;
    currentPrice?: number;
  },
  metadataMap: Record<string, CoinMetadata>,
  realtimeMap: Record<string, RealtimeState>
): AssetValuation | null => {
  const symbol = getUpperSymbol(asset.symbol);
  if (!symbol || symbol === 'CASH') {
    return null;
  }

  const amount = ensureFiniteNumber(normalizeNumber(asset.amount));
  const averageCost = ensureFiniteNumber(normalizeNumber(asset.avgPrice));
  const price = ensureFiniteNumber(selectBestPrice(symbol, asset, metadataMap, realtimeMap));
  const value = ensureFiniteNumber(amount * price);
  const cost = ensureFiniteNumber(amount * averageCost);
  const pnlValue = ensureFiniteNumber(value - cost);
  const pnlPercent = cost > 0 ? ensureFiniteNumber((pnlValue / cost) * 100) : 0;
  const name = metadataMap[symbol]?.name ?? getFallbackName(symbol);

  return {
    id: asset._id,
    symbol,
    name,
    amount,
    averageCost,
    price,
    value,
    cost,
    pnlValue,
    pnlPercent,
    iconUrl: getAssetIconPath(symbol),
  };
};

type AssetValuationContextValue = {
  isAuthenticated: boolean;
  assetValuations: AssetValuation[];
  totalValue: number;
  totalCost: number;
  totalPnlValue: number;
  totalPnlPercent: number;
  allocationSlices: AllocationSlice[];
  allocationAssetCount: number;
  isSummaryLoading: boolean;
  combinedError?: string;
};

const AssetValuationContext = createContext<AssetValuationContextValue | undefined>(undefined);

type AssetValuationProviderProps = {
  children: ReactNode;
};

const PriceSubscriber = ({
  symbol,
  onUpdate,
}: {
  symbol: string;
  onUpdate: (symbol: string, update: RealtimeUpdate) => void;
}) => {
  const { numericPrice, isPriceLoading } = useMarketPrice(symbol, { throttleMs: 500 });
  const lastPayloadRef = useRef<RealtimeUpdate | null>(null);

  useEffect(() => {
    const payload: RealtimeUpdate = {
      price: typeof numericPrice === 'number' ? numericPrice : null,
      isLoading: isPriceLoading,
    };

    const lastPayload = lastPayloadRef.current;
    if (
      lastPayload &&
      lastPayload.price === payload.price &&
      lastPayload.isLoading === payload.isLoading
    ) {
      return;
    }

    lastPayloadRef.current = payload;
    onUpdate(symbol, payload);
  }, [symbol, numericPrice, isPriceLoading, onUpdate]);

  return null;
};

export function AssetValuationProvider({ children }: AssetValuationProviderProps) {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const shouldSkipQuery = status === 'unauthenticated';

  const {
    data: assets,
    isLoading: isAssetsLoading,
    error: assetsError,
  } = useGetAllAssets({
    enabled: isAuthenticated,
  });

  const [coinMetadata, setCoinMetadata] = useState<Record<string, CoinMetadata>>({});
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [realtimeState, setRealtimeState] = useState<Record<string, RealtimeState>>({});

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    setCoinMetadata({});
    setRealtimeState({});
    setMetadataError(null);
    setIsMetadataLoading(false);
  }, [isAuthenticated]);

  const tradableSymbols = useMemo(() => {
    if (!isAuthenticated || !assets || assets.length === 0) {
      return [];
    }

    return Array.from(
      new Set(
        assets
          .map((asset) => getUpperSymbol(asset?.symbol))
          .filter((symbol): symbol is string => symbol.length > 0 && symbol !== 'CASH')
      )
    );
  }, [assets, isAuthenticated]);

  useEffect(() => {
    if (tradableSymbols.length === 0) {
      setMetadataError(null);
      setIsMetadataLoading(false);
      return;
    }

    let isCancelled = false;
    setIsMetadataLoading(true);

    fetchCoinMetadata(tradableSymbols)
      .then((metadata) => {
        if (isCancelled) return;

        if (Object.keys(metadata).length === 0) {
          setCoinMetadata((prev) => ({ ...prev, ...getFallbackMetadata(tradableSymbols) }));
          setMetadataError(null);
          return;
        }

        setCoinMetadata((prev) => ({ ...prev, ...metadata }));
        setMetadataError(null);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('Failed to fetch coin metadata for asset valuations:', err);
        setCoinMetadata((prev) => ({ ...prev, ...getFallbackMetadata(tradableSymbols) }));
        setMetadataError('Unable to load latest prices. Showing cached data if available.');
      })
      .finally(() => {
        if (!isCancelled) {
          setIsMetadataLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [tradableSymbols]);

  useEffect(() => {
    if (tradableSymbols.length === 0) {
      setRealtimeState({});
      return;
    }

    setRealtimeState((prev) => {
      const next: Record<string, RealtimeState> = {};
      tradableSymbols.forEach((symbol) => {
        next[symbol] = prev[symbol] ?? { price: null, isLoading: true };
      });
      return next;
    });
  }, [tradableSymbols]);

  const handleRealtimeUpdate = useCallback((symbol: string, update: RealtimeUpdate) => {
    setRealtimeState((prev) => {
      const previous = prev[symbol];
      if (previous && previous.price === update.price && previous.isLoading === update.isLoading) {
        return prev;
      }

      return {
        ...prev,
        [symbol]: {
          price: update.price,
          isLoading: update.isLoading,
        },
      };
    });
  }, []);

  const assetValuations = useMemo<AssetValuation[]>(() => {
    if (!isAuthenticated || !assets || assets.length === 0) {
      return [];
    }

    return assets
      .map((asset) => calculateAssetValuation(asset, coinMetadata, realtimeState))
      .filter((entry): entry is AssetValuation => Boolean(entry));
  }, [assets, coinMetadata, realtimeState, isAuthenticated]);

  const { totalValue, totalCost, totalPnlValue, totalPnlPercent } = useMemo(() => {
    if (!isAuthenticated || assetValuations.length === 0) {
      return { totalValue: 0, totalCost: 0, totalPnlValue: 0, totalPnlPercent: 0 };
    }

    const aggregateValue = assetValuations.reduce((acc, asset) => acc + asset.value, 0);
    const aggregateCost = assetValuations.reduce((acc, asset) => acc + asset.cost, 0);
    const aggregatePnlValue = aggregateValue - aggregateCost;
    const aggregatePnlPercent = aggregateCost > 0 ? (aggregatePnlValue / aggregateCost) * 100 : 0;

    return {
      totalValue: ensureFiniteNumber(aggregateValue),
      totalCost: ensureFiniteNumber(aggregateCost),
      totalPnlValue: ensureFiniteNumber(aggregatePnlValue),
      totalPnlPercent: ensureFiniteNumber(aggregatePnlPercent),
    };
  }, [assetValuations, isAuthenticated]);

  const { slices: allocationSlices, assetCount: allocationAssetCount } = useMemo(() => {
    if (!isAuthenticated) {
      return { slices: [] as AllocationSlice[], assetCount: 0 };
    }

    const positiveAssets = assetValuations.filter((asset) => asset.value > 0);
    if (positiveAssets.length === 0) {
      return { slices: [] as AllocationSlice[], assetCount: 0 };
    }

    const sorted = [...positiveAssets].sort((a, b) => b.value - a.value);
    const aggregateValue = sorted.reduce((acc, item) => acc + item.value, 0);

    if (aggregateValue <= 0) {
      return { slices: [] as AllocationSlice[], assetCount: 0 };
    }

    const MAX_VISIBLE_SEGMENTS = 6;
    const DEFAULT_ICON = '/currency-icons/default-coin.svg';
    const COLOR_PALETTE = ['#142968', '#2141B0', '#2E59F4', '#4E6CFF', '#6F7CFF', '#8D7BFF', '#3ADDD0'];

    const shouldGroupIntoOther = sorted.length >= MAX_VISIBLE_SEGMENTS;
    const visibleCount = shouldGroupIntoOther ? MAX_VISIBLE_SEGMENTS - 1 : sorted.length;
    const topSlices = sorted.slice(0, visibleCount);
    const remainder = shouldGroupIntoOther ? sorted.slice(visibleCount) : [];

    const slices: AllocationSlice[] = topSlices.map((item, index) => ({
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      value: item.value,
      cost: item.cost,
      percentage: (item.value / aggregateValue) * 100,
      pnlValue: item.pnlValue,
      pnlPercent: item.pnlPercent,
      iconUrl: item.iconUrl,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    }));

    if (shouldGroupIntoOther && remainder.length > 0) {
      const otherValue = remainder.reduce((acc, item) => acc + item.value, 0);
      const otherCost = remainder.reduce((acc, item) => acc + item.cost, 0);
      const otherPnlValue = otherValue - otherCost;
      const otherHoldings = remainder.map((item) => ({
        id: item.id,
        symbol: item.symbol,
        value: item.value,
        amount: item.amount,
        averageCost: item.averageCost,
        cost: item.cost,
        pnlValue: item.pnlValue,
      }));

      if (otherValue > 0) {
        const otherColor = COLOR_PALETTE[Math.min(MAX_VISIBLE_SEGMENTS - 1, COLOR_PALETTE.length - 1)];
        slices.push({
          id: 'other',
          symbol: 'Other',
          name: `${remainder.length} assets`,
          value: otherValue,
          cost: otherCost,
          percentage: (otherValue / aggregateValue) * 100,
          pnlValue: otherPnlValue,
          pnlPercent: otherCost > 0 ? (otherPnlValue / otherCost) * 100 : 0,
          iconUrl: DEFAULT_ICON,
          color: otherColor,
          otherHoldings,
          isOther: true,
        });
      }
    }

    return { slices, assetCount: slices.length };
  }, [assetValuations, isAuthenticated]);

  const combinedError = useMemo(() => {
    if (shouldSkipQuery) {
      return 'Please log in again';
    }

    return assetsError?.message || metadataError || undefined;
  }, [assetsError?.message, metadataError, shouldSkipQuery]);

  const isSummaryLoading = isAuthenticated && (isAssetsLoading || isMetadataLoading);

  const contextValue = useMemo<AssetValuationContextValue>(
    () => ({
      isAuthenticated,
      assetValuations,
      totalValue,
      totalCost,
      totalPnlValue,
      totalPnlPercent,
      allocationSlices,
      allocationAssetCount,
      isSummaryLoading,
      combinedError,
    }),
    [
      isAuthenticated,
      assetValuations,
      totalValue,
      totalCost,
      totalPnlValue,
      totalPnlPercent,
      allocationSlices,
      allocationAssetCount,
      isSummaryLoading,
      combinedError,
    ]
  );

  return (
    <AssetValuationContext.Provider value={contextValue}>
      {isAuthenticated &&
        tradableSymbols.map((symbol) => (
          <PriceSubscriber key={symbol} symbol={symbol} onUpdate={handleRealtimeUpdate} />
        ))}
      {children}
    </AssetValuationContext.Provider>
  );
}

export const useAssetValuations = () => {
  const context = useContext(AssetValuationContext);
  if (!context) {
    throw new Error('useAssetValuations must be used within an AssetValuationProvider');
  }
  return context;
};
