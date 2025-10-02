'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useGetAllAssets } from '@/features/assets/hooks/useGetAllAssets';
import HoldingAssetsSection from '../components/HoldingAssetsSection';
import {
  fetchCoinMetadata,
  getFallbackMetadata,
  getFallbackName,
  normalizeNumber,
  type CoinMetadata,
} from '../utils/coinMetadata';

interface AssetRow {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  currentPrice: number;
  averageCost: number;
  value: number;
  pnlAbs: number;
  pnlPct: number;
}

interface HoldingAssetsContainerProps {
  pageSize?: number;
}

const getUpperSymbol = (symbol: string | undefined | null) => {
  if (!symbol) return '';
  return symbol.trim().toUpperCase();
};

const mergeMetadata = (
  previous: Record<string, CoinMetadata>,
  next: Record<string, CoinMetadata>
) => {
  if (Object.keys(next).length === 0) {
    return previous;
  }

  return {
    ...previous,
    ...next,
  };
};

export default function HoldingAssetsContainer({ pageSize = 10 }: HoldingAssetsContainerProps) {
  const {
    data: assets,
    isLoading,
    error,
  } = useGetAllAssets({
    enabled: true,
  });

  const [rows, setRows] = useState<AssetRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [coinMetadata, setCoinMetadata] = useState<Record<string, CoinMetadata>>({});

  const tradableAssets = useMemo(() => {
    if (!assets || assets.length === 0) return [];
    return assets.filter((asset) => getUpperSymbol(asset.symbol) !== 'CASH');
  }, [assets]);

  useEffect(() => {
    if (tradableAssets.length === 0) return;

    const symbols = tradableAssets.map((asset) => asset.symbol);
    const uniqueSymbols = Array.from(new Set(symbols));
    let isCancelled = false;

    const loadCoinMetadata = async () => {
      try {
        const metadata = await fetchCoinMetadata(uniqueSymbols);
        if (isCancelled) return;

        if (Object.keys(metadata).length === 0) {
          setCoinMetadata((prev) => mergeMetadata(prev, getFallbackMetadata(uniqueSymbols)));
          return;
        }

        setCoinMetadata((prev) => mergeMetadata(prev, metadata));
      } catch (err) {
        if (isCancelled) return;
        console.error('Failed to load coin metadata:', err);
        setCoinMetadata((prev) => mergeMetadata(prev, getFallbackMetadata(uniqueSymbols)));
      }
    };

    loadCoinMetadata();

    return () => {
      isCancelled = true;
    };
  }, [tradableAssets]);

  useEffect(() => {
    if (tradableAssets.length === 0) {
      setRows([]);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    try {
      const processedData = tradableAssets.map((asset) => {
        const upperSymbol = getUpperSymbol(asset.symbol);
        const metadata = coinMetadata[upperSymbol];

        const amount = normalizeNumber(asset.amount);
        const metadataPrice = normalizeNumber(metadata?.price);
        const apiPrice = normalizeNumber(asset.currentPrice);
        const currentPrice = metadataPrice > 0 ? metadataPrice : apiPrice;
        const averageCost = normalizeNumber(asset.avgPrice);
        const totalCost = normalizeNumber(asset.total);
        const value = amount * currentPrice;
        const pnlAbs = value - totalCost;
        const pnlPct = totalCost > 0 ? pnlAbs / totalCost : 0;

        return {
          id: asset._id,
          symbol: asset.symbol,
          name: metadata?.name || getFallbackName(upperSymbol || asset.symbol),
          amount,
          currentPrice,
          averageCost,
          value,
          pnlAbs,
          pnlPct,
        };
      });

      setRows(processedData);
    } catch (err) {
      console.error('Error processing asset data:', err);
      setRows([]);
    } finally {
      setIsProcessing(false);
    }
  }, [tradableAssets, coinMetadata]);

  const loadingState: string | undefined = undefined;
  const combinedError = error?.message;

  return (
    <HoldingAssetsSection
      rows={rows}
      pageSize={pageSize}
      isLoading={isLoading || isProcessing}
      loadingMessage={loadingState}
      error={combinedError}
    />
  );
}
