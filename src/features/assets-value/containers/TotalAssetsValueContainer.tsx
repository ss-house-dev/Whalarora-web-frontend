'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TotalAssetsValueCard from '../components/TotalAssetsValueCard';
import { useGetAllAssets } from '@/features/assets/hooks/useGetAllAssets';
import {
  fetchCoinMetadata,
  getFallbackMetadata,
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

// ฟังก์ชันตัดทศนิยม (เหมือนกับที่ใช้ใน TotalAssetsValueCard)
const truncateToDecimals = (value: number, decimals = 2) => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const factor = 10 ** decimals;
  return Math.trunc(value * factor) / factor;
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

  // คำนวณ totalValue แบบดิบก่อน
  const totalValueRaw = useMemo(() => {
    if (!assets || assets.length === 0) {
      return 0;
    }

    return assets.reduce((accumulator, asset) => {
      const symbol = getUpperSymbol(asset?.symbol);
      if (symbol.length === 0 || symbol === 'CASH') {
        return accumulator;
      }

      const amount = normalizeNumber(asset?.amount);
      const realTimePrice = realtimeState[symbol]?.price;
      const metadataPrice = normalizeNumber(coinMetadata[symbol]?.price);
      const apiPrice = normalizeNumber(asset?.currentPrice);

      const priceCandidate =
        typeof realTimePrice === 'number' && realTimePrice > 0
          ? realTimePrice
          : metadataPrice > 0
            ? metadataPrice
            : apiPrice;

      const price = normalizeNumber(priceCandidate);

      return accumulator + amount * price;
    }, 0);
  }, [assets, coinMetadata, realtimeState]);

  // คำนวณ totalCost แบบดิบก่อน
  const totalCostRaw = useMemo(() => {
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

  // ตัดทศนิยมค่าที่จะแสดงผล (เหมือนกับที่ TotalAssetsValueCard จะทำ)
  const totalValue = useMemo(() => truncateToDecimals(totalValueRaw, 2), [totalValueRaw]);
  const totalCost = useMemo(() => truncateToDecimals(totalCostRaw, 2), [totalCostRaw]);

  // คำนวณ PnL จากค่าที่ตัดทศนิยมแล้ว
  const pnlValue = useMemo(() => {
    const result = totalValue - totalCost;
    return truncateToDecimals(result, 2);
  }, [totalValue, totalCost]);

  // คำนวณ PnL Percent จากค่าดิบเพื่อความแม่นยำ
  const pnlPercent = useMemo(() => {
    if (totalCostRaw <= 0) {
      return 0;
    }
    const pnlRaw = totalValueRaw - totalCostRaw;
    const result = (pnlRaw / totalCostRaw) * 100;
    return truncateToDecimals(result, 4);
  }, [totalValueRaw, totalCostRaw]);

  const combinedError = error?.message || metadataError || undefined;

  return (
    <>
      {tradableSymbols.map((symbol) => (
        <PriceSubscriber key={symbol} symbol={symbol} onUpdate={handleRealtimeUpdate} />
      ))}
      <TotalAssetsValueCard
        totalValue={totalValue}
        totalCost={totalCost}
        pnlValue={pnlValue}
        pnlPercent={pnlPercent}
        isLoading={isLoading || isMetadataLoading}
        error={combinedError}
      />
    </>
  );
}
