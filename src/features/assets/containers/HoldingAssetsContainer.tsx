'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useGetAllAssets } from '@/features/assets/hooks/useGetAllAssets';
import HoldingAssetsSection from '../components/HoldingAssetsSection';

// Cache สำหรับเก็บชื่อเหรียญที่ดึงมาแล้ว
let coinNameCache: Record<string, string> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cacheTimestamp = 0;

// Interface สำหรับข้อมูลจาก CoinGecko
interface CoinGeckoCoin {
  symbol: string;
  name: string;
}

// Interface สำหรับ rows
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

// Helper function สำหรับดึงชื่อเหรียญจาก CoinGecko API
const fetchCoinNames = async (symbols: string[]): Promise<Record<string, string>> => {
  try {
    const now = Date.now();
    if (now - cacheTimestamp < CACHE_DURATION && Object.keys(coinNameCache).length > 0) {
      return coinNameCache;
    }

    const symbolList = symbols.join(',');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&symbols=${symbolList}&order=market_cap_desc&per_page=250&page=1&sparkline=false`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data: CoinGeckoCoin[] = await response.json();
    const nameMap: Record<string, string> = {};

    data.forEach((coin: CoinGeckoCoin) => {
      if (coin.symbol && coin.name) {
        nameMap[coin.symbol.toUpperCase()] = coin.name;
      }
    });

    if (Object.keys(nameMap).length > 0) {
      coinNameCache = { ...coinNameCache, ...nameMap };
      cacheTimestamp = now;
    }

    return nameMap;
  } catch (error) {
    console.error('Error fetching coin names from CoinGecko:', error);
    return {};
  }
};

// Mapping พื้นฐานสำหรับ fallback
const getBasicAssetName = (symbol: string): string => {
  const basicNameMap: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    USDT: 'Tether',
    BNB: 'BNB',
    SOL: 'Solana',
    USDC: 'USD Coin',
    XRP: 'XRP',
    DOGE: 'Dogecoin',
    ADA: 'Cardano',
    SHIB: 'Shiba Inu',
    AVAX: 'Avalanche',
    DOT: 'Polkadot',
    LINK: 'Chainlink',
    MATIC: 'Polygon',
    LTC: 'Litecoin',
    UNI: 'Uniswap',
    ATOM: 'Cosmos',
  };

  return basicNameMap[symbol.toUpperCase()] || symbol;
};

const getBasicAssetMapping = (symbols: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {};
  symbols.forEach((symbol) => {
    mapping[symbol.toUpperCase()] = getBasicAssetName(symbol);
  });
  return mapping;
};

interface HoldingAssetsContainerProps {
  pageSize?: number;
}

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
  const [coinNames, setCoinNames] = useState<Record<string, string>>({});

  // กรอง CASH และเตรียมข้อมูลพื้นฐาน
  const tradableAssets = useMemo(() => {
    if (!assets || assets.length === 0) return [];
    return assets.filter((asset) => asset.symbol !== 'CASH');
  }, [assets]);

  // ดึงชื่อเหรียญจาก API
  useEffect(() => {
    const loadCoinNames = async () => {
      if (tradableAssets.length === 0) return;

      try {
        const symbols = tradableAssets.map((asset) => asset.symbol);
        const uniqueSymbols = [...new Set(symbols)];

        const nameMap = await fetchCoinNames(uniqueSymbols);
        setCoinNames(nameMap);
      } catch (error) {
        console.error('Failed to load coin names:', error);
        const fallbackMap = getBasicAssetMapping(tradableAssets.map((asset) => asset.symbol));
        setCoinNames(fallbackMap);
      }
    };

    loadCoinNames();
  }, [tradableAssets]);

  // ประมวลผลข้อมูล
  useEffect(() => {
    const processData = async () => {
      if (tradableAssets.length === 0) {
        setRows([]);
        setIsProcessing(false);
        return;
      }

      setIsProcessing(true);
      try {
        const processedData = tradableAssets.map((asset) => {
          const currentPrice = 0.0; // ตัวอย่างราคา
          const value = asset.amount * currentPrice;
          const pnlAbs = value - asset.total;
          const pnlPct = asset.total > 0 ? pnlAbs / asset.total : 0;

          return {
            id: asset._id,
            symbol: asset.symbol,
            name: coinNames[asset.symbol.toUpperCase()] || asset.symbol,
            amount: asset.amount,
            currentPrice,
            averageCost: asset.avgPrice,
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
    };

    processData();
  }, [tradableAssets, coinNames]);

  // กำหนดสถานะสำหรับส่งไปยัง HoldingAssetsSection
  const loadingState: string | undefined = undefined;
  const errorMessage: string | undefined = undefined;

  return (
    <HoldingAssetsSection
      rows={rows}
      pageSize={pageSize}
      isLoading={isLoading || isProcessing}
      loadingMessage={loadingState}
      error={error ? error.message : errorMessage}
    />
  );
}
