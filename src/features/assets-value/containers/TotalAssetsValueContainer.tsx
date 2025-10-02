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
import { useSymbolPrecisions, getSymbolPrecision, decimalsFromSize, type SymbolPrecision } from '@/features/trading/utils/symbolPrecision';

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

const MAX_AMOUNT_DIGITS = 10;

const getAmountDecimalPlaces = (value: number, precision?: SymbolPrecision | null) => {
  const absolute = Math.abs(value);
  const integerDigits = Math.max(1, Math.floor(absolute).toString().length);
  const availableDecimals = Math.max(0, MAX_AMOUNT_DIGITS - integerDigits);
  const quantityDecimals = precision?.quantityPrecision ?? availableDecimals;
  return Math.min(quantityDecimals, availableDecimals);
};

const roundAmountForDisplay = (value: number, precision?: SymbolPrecision | null) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const decimals = getAmountDecimalPlaces(value, precision);
  const factor = 10 ** decimals;
  const rounded = Math.round(Math.abs(value) * factor) / factor;

  return value < 0 ? -rounded : rounded;
};

const roundPriceForDisplay = (value: number, precision?: SymbolPrecision | null) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const decimals =
    precision?.pricePrecision ??
    (precision?.tickSize ? decimalsFromSize(precision.tickSize) : undefined) ??
    2;

  const factor = 10 ** decimals;
  const rounded = Math.round(Math.abs(value) * factor) / factor;

  return value < 0 ? -rounded : rounded;
};

const PriceSubscriber = ({
  symbol,
  onUpdate,
}: {
  symbol: string;
  onUpdate: (symbol: string, update: RealtimeUpdate) => void;
}) => {
  const { marketPrice, isPriceLoading } = useMarketPrice(symbol);

  const numericPrice = useMemo(() => {
    if (!marketPrice) return null;
    const sanitized = marketPrice.replace(/,/g, '');
    const parsed = Number.parseFloat(sanitized);
    return Number.isFinite(parsed) ? parsed : null;
  }, [marketPrice]);

  const lastPayloadRef = useRef<RealtimeUpdate | null>(null);

  useEffect(() => {
    const payload: RealtimeUpdate = {
      price: numericPrice,
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

  const { data: precisionMap } = useSymbolPrecisions();

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

  const handleRealtimeUpdate = useCallback(
    (symbol: string, update: RealtimeUpdate) => {
      setRealtimeState((prev) => {
        const previous = prev[symbol];
        if (
          previous &&
          previous.price === update.price &&
          previous.isLoading === update.isLoading
        ) {
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
    },
    []
  );

  const totalValue = useMemo(() => {
    if (!assets || assets.length === 0) {
      return 0;
    }

    return assets.reduce((accumulator, asset) => {
      const symbol = getUpperSymbol(asset?.symbol);
      if (symbol.length === 0 || symbol === 'CASH') {
        return accumulator;
      }

      const symbolPrecision = getSymbolPrecision(precisionMap, symbol, 'USDT');
      const rawAmount = normalizeNumber(asset?.amount);
      const amount = roundAmountForDisplay(rawAmount, symbolPrecision);
      const realTimePrice = realtimeState[symbol]?.price;
      const metadataPrice = normalizeNumber(coinMetadata[symbol]?.price);
      const apiPrice = normalizeNumber(asset?.currentPrice);

      const priceToUse = normalizeNumber(
        realTimePrice !== null && realTimePrice !== undefined && realTimePrice > 0
          ? realTimePrice
          : metadataPrice > 0
            ? metadataPrice
            : apiPrice
      );

      const price = roundPriceForDisplay(priceToUse, symbolPrecision);

      return accumulator + amount * price;
    }, 0);
  }, [assets, coinMetadata, precisionMap, realtimeState]);

  const totalCost = useMemo(() => {
    if (!assets || assets.length === 0) {
      return 0;
    }

    return assets.reduce((accumulator, asset) => {
      const symbol = getUpperSymbol(asset?.symbol);
      if (symbol.length === 0 || symbol === 'CASH') {
        return accumulator;
      }

      const symbolPrecision = getSymbolPrecision(precisionMap, symbol, 'USDT');
      const rawAmount = normalizeNumber(asset?.amount);
      const amount = roundAmountForDisplay(rawAmount, symbolPrecision);
      const averageCost = normalizeNumber(asset?.avgPrice);
      const costPrice = roundPriceForDisplay(averageCost, symbolPrecision);

      return accumulator + amount * costPrice;
    }, 0);
  }, [assets, precisionMap]);

  const pnlValue = useMemo(() => totalValue - totalCost, [totalValue, totalCost]);

  const pnlPercent = useMemo(() => {
    if (totalCost <= 0) {
      return 0;
    }

    return (pnlValue / totalCost) * 100;
  }, [pnlValue, totalCost]);

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
