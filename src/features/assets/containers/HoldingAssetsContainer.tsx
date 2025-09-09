'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useGetAllAssets } from '@/features/assets/hooks/useGetAllAssets';
import HoldingAssetsSection from '../components/HoldingAssetsSection';

// Helper function สำหรับแปลง symbol เป็นชื่อเต็ม
const getAssetName = (symbol: string): string => {
  const nameMap: Record<string, string> = {
    BTC: 'Bitcoin',
    ADA: 'Cardano',
    ETH: 'Ethereum',
    BNB: 'Binance Coin',
    DOGE: 'Dogecoin',
    // เพิ่มสกุลเงินอื่นๆ ตามต้องการ
  };
  return nameMap[symbol] || symbol;
};

// Mock function สำหรับดึงราคาปัจจุบัน (ควรแทนที่ด้วย API จริง)
const getCurrentPrices = async (symbols: string[]): Promise<Record<string, number>> => {
  // ในที่นี้ควรเรียก API เพื่อดึงราคาปัจจุบัน
  // เช่น จาก Binance API หรือ API อื่นๆ
  const mockPrices: Record<string, number> = {
    BTC: 65000,
    ADA: 0.5,
    ETH: 3000,
    // เพิ่มสกุลเงินอื่นๆ ตามต้องการ
  };
  return mockPrices;
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

  // กรอง CASH และเตรียมข้อมูลพื้นฐาน
  const tradableAssets = useMemo(() => {
    if (!assets || assets.length === 0) return [];
    return assets.filter(asset => asset.symbol !== 'CASH');
  }, [assets]);

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
        // ดึงราคาปัจจุบันของสินทรัพย์ทั้งหมด
        const symbols = tradableAssets.map(asset => asset.symbol);
        const currentPrices = await getCurrentPrices(symbols);

        const processedData = tradableAssets.map(asset => {
          const currentPrice = currentPrices[asset.symbol] || 0;
          const value = asset.amount * currentPrice;
          const pnlAbs = value - asset.total;
          const pnlPct = asset.total > 0 ? pnlAbs / asset.total : 0;

          return {
            id: asset._id,
            symbol: asset.symbol,
            name: getAssetName(asset.symbol),
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
  }, [tradableAssets]);

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
  if (isProcessing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Processing asset data...</div>
      </div>
    );
  }

  // Render main component
  return <HoldingAssetsSection rows={rows} pageSize={pageSize} />;
}