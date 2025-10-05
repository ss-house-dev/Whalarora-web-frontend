'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TotalAssetsValueCard from '../components/TotalAssetsValueCard';
import AssetsAllocationDonut, { AllocationSlice } from '../components/AssetsAllocationDonut';
import { useGetAllAssets } from '@/features/assets/hooks/useGetAllAssets';
import {
  fetchCoinMetadata,
  getFallbackMetadata,
  getFallbackName,
  normalizeNumber,
  type CoinMetadata,
} from '@/features/assets/utils/coinMetadata';
import { useMarketPrice } from '@/features/trading/hooks/useMarketPrice';

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

const COLOR_PALETTE = ['#142968', '#2141B0', '#2E59F4', '#4E6CFF', '#6F7CFF', '#8D7BFF', '#3ADDD0'];

type AssetValuation = {
  symbol: string;
  name: string;
  amount: number;
  price: number;
  value: number;
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

export default function TotalAssetsValueContainer() {
  const {
    data: assets,
    isLoading,
    error,
  } = useGetAllAssets({
    enabled: true,
  });

  const [coinMetadata, setCoinMetadata] = useState<Record<string, CoinMetadata>>({});
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [realtimeState, setRealtimeState] = useState<Record<string, RealtimeState>>({});

  const tradableSymbols = useMemo(() => {
    if (!assets || assets.length === 0) {
      return [];
    }

    return Array.from(
      new Set(
        assets
          .map((asset) => getUpperSymbol(asset?.symbol))
          .filter((symbol): symbol is string => symbol.length > 0 && symbol !== 'CASH')
      )
    );
  }, [assets]);

  useEffect(() => {
    if (tradableSymbols.length === 0) {
      setMetadataError(null);
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
        console.error('Failed to fetch coin metadata for total assets:', err);
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
    if (!assets || assets.length === 0) {
      return [];
    }

    return assets
      .map((asset) => {
        const symbol = getUpperSymbol(asset.symbol);
        if (!symbol || symbol === 'CASH') {
          return null;
        }

        const amount = normalizeNumber(asset.amount);
        const price = selectBestPrice(symbol, asset, coinMetadata, realtimeState);
        const value = amount * price;
        const name = coinMetadata[symbol]?.name ?? getFallbackName(symbol);

        return {
          symbol,
          name,
          amount,
          price,
          value,
        } satisfies AssetValuation;
      })
      .filter((entry): entry is AssetValuation => Boolean(entry));
  }, [assets, coinMetadata, realtimeState]);

  const totalValue = useMemo(() => {
    if (assetValuations.length === 0) {
      return 0;
    }

    return assetValuations.reduce((accumulator, asset) => accumulator + asset.value, 0);
  }, [assetValuations]);

  const totalCost = useMemo(() => {
    if (!assets || assets.length === 0) {
      return 0;
    }

    return assets.reduce((accumulator, asset) => {
      const symbol = getUpperSymbol(asset?.symbol);
      if (symbol.length === 0 || symbol === 'CASH') {
        return accumulator;
      }

      const amount = normalizeNumber(asset?.amount);
      const averageCost = normalizeNumber(asset?.avgPrice);

      return accumulator + amount * averageCost;
    }, 0);
  }, [assets]);

  const pnlValue = useMemo(() => totalValue - totalCost, [totalValue, totalCost]);

  const pnlPercent = useMemo(() => {
    if (totalCost <= 0) {
      return 0;
    }

    return (pnlValue / totalCost) * 100;
  }, [pnlValue, totalCost]);

  const { slices: allocationSlices, assetCount: allocationAssetCount } = useMemo(() => {
    const positiveAssets = assetValuations.filter((asset) => asset.value > 0);
    if (positiveAssets.length === 0) {
      return { slices: [] as AllocationSlice[], assetCount: 0 };
    }

    const sorted = [...positiveAssets].sort((a, b) => b.value - a.value);
    const aggregateValue = sorted.reduce((acc, item) => acc + item.value, 0);

    if (aggregateValue <= 0) {
      return { slices: [] as AllocationSlice[], assetCount: 0 };
    }

    const topSlices = sorted.slice(0, 6);
    const remainder = sorted.slice(6);

    const slices: AllocationSlice[] = topSlices.map((item, index) => ({
      id: item.symbol,
      symbol: item.symbol,
      name: item.name,
      value: item.value,
      percentage: (item.value / aggregateValue) * 100,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    }));

    if (remainder.length > 0) {
      const otherValue = remainder.reduce((acc, item) => acc + item.value, 0);
      if (otherValue > 0) {
        const index = slices.length % COLOR_PALETTE.length;
        slices.push({
          id: 'other',
          symbol: 'Other',
          name: `${remainder.length} assets`,
          value: otherValue,
          percentage: (otherValue / aggregateValue) * 100,
          color: COLOR_PALETTE[index],
          isOther: true,
        });
      }
    }

    return { slices, assetCount: positiveAssets.length };
  }, [assetValuations]);

  const combinedError = error?.message || metadataError || undefined;
  const isSummaryLoading = isLoading || isMetadataLoading;

  return (
    <>
      {tradableSymbols.map((symbol) => (
        <PriceSubscriber key={symbol} symbol={symbol} onUpdate={handleRealtimeUpdate} />
      ))}
      <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-stretch">
        <TotalAssetsValueCard
          totalValue={totalValue}
          totalCost={totalCost}
          pnlValue={pnlValue}
          pnlPercent={pnlPercent}
          isLoading={isSummaryLoading}
          error={combinedError}
          className="lg:max-w-[603px] lg:flex-[2]"
        />
        <AssetsAllocationDonut
          slices={allocationSlices}
          totalAssetCount={allocationAssetCount}
          className="lg:max-w-[360px] lg:flex-1"
        />
      </div>
    </>
  );
}
