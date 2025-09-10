'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useGetAllAssets } from '@/features/assets/hooks/useGetAllAssets';
import HoldingAssetsSection from '../components/HoldingAssetsSection';

// Cache สำหรับเก็บชื่อเหรียญที่ดึงมาแล้ว
let coinNameCache: Record<string, string> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cacheTimestamp = 0;

// Helper function สำหรับดึงชื่อเหรียญจาก CoinGecko API
const fetchCoinNames = async (symbols: string[]): Promise<Record<string, string>> => {
  try {
    // ตรวจสอบ cache ก่อน
    const now = Date.now();
    if (now - cacheTimestamp < CACHE_DURATION && Object.keys(coinNameCache).length > 0) {
      return coinNameCache;
    }

    // สร้าง symbol list สำหรับ query
    const symbolList = symbols.join(',');
    
    // Option 1: ใช้ CoinGecko API (ฟรี)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&symbols=${symbolList}&order=market_cap_desc&per_page=250&page=1&sparkline=false`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const nameMap: Record<string, string> = {};

    data.forEach((coin: any) => {
      nameMap[coin.symbol.toUpperCase()] = coin.name;
    });

    // อัพเดท cache
    coinNameCache = { ...coinNameCache, ...nameMap };
    cacheTimestamp = now;

    return nameMap;
  } catch (error) {
    console.error('Error fetching coin names from CoinGecko:', error);
    
    // Fallback to CoinMarketCap-style API (หากมี API key)
    try {
      const binanceResponse = await fetch(
        'https://api.binance.com/api/v3/exchangeInfo'
      );
      
      if (binanceResponse.ok) {
        const binanceData = await binanceResponse.json();
        const fallbackMap: Record<string, string> = {};
        
        // ดึงข้อมูลจาก Binance (จำกัดแต่เชื่อถือได้)
        binanceData.symbols?.forEach((symbol: any) => {
          const baseAsset = symbol.baseAsset;
          // ใช้ mapping พื้นฐานสำหรับ fallback
          fallbackMap[baseAsset] = getBasicAssetName(baseAsset);
        });
        
        return fallbackMap;
      }
    } catch (fallbackError) {
      console.error('Error fetching from fallback APIs:', fallbackError);
    }
    
    // หากทุก API ล้มเหลว ใช้ mapping พื้นฐาน
    return getBasicAssetMapping(symbols);
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
    // เพิ่มเหรียญยอดนิยมอื่นๆ ตามต้องการ
  };
  
  return basicNameMap[symbol.toUpperCase()] || symbol;
};

const getBasicAssetMapping = (symbols: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {};
  symbols.forEach(symbol => {
    mapping[symbol.toUpperCase()] = getBasicAssetName(symbol);
  });
  return mapping;
};

interface HoldingAssetsContainerProps {
  pageSize?: number;
}

export default function HoldingAssetsContainer({ 
  pageSize = 10 
}: HoldingAssetsContainerProps) {
  const { data: assets, isLoading, error } = useGetAllAssets({
    enabled: true,
  });
    
  const [rows, setRows] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [coinNames, setCoinNames] = useState<Record<string, string>>({});

  // กรอง CASH และเตรียมข้อมูลพื้นฐาน
  const tradableAssets = useMemo(() => {
    if (!assets || assets.length === 0) return [];
    return assets.filter(asset => asset.symbol !== 'CASH');
  }, [assets]);

  // ดึงชื่อเหรียญจาก API
  useEffect(() => {
    const loadCoinNames = async () => {
      if (tradableAssets.length === 0) return;

      try {
        const symbols = tradableAssets.map(asset => asset.symbol);
        const uniqueSymbols = [...new Set(symbols)]; // Remove duplicates
        
        const nameMap = await fetchCoinNames(uniqueSymbols);
        setCoinNames(nameMap);
      } catch (error) {
        console.error('Failed to load coin names:', error);
        // ใช้ basic mapping เป็น fallback
        const fallbackMap = getBasicAssetMapping(
          tradableAssets.map(asset => asset.symbol)
        );
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
        const processedData = tradableAssets.map(asset => {
          // กำหนดราคาสินทรัพย์โดยตรงที่นี่
          const currentPrice = 0.00; // ตัวอย่างราคา
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading assets...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  // Processing state
  if (isProcessing || Object.keys(coinNames).length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading coin information...</div>
      </div>
    );
  }

  // Render main component
  return <HoldingAssetsSection rows={rows} pageSize={pageSize} />;
}