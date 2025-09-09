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
        // ใช้ข้อมูลราคาที่กำหนดเอง หรือใช้ค่าคงที่
        const processedData = tradableAssets.map(asset => {
          // กำหนดราคาสินทรัพย์โดยตรงที่นี่
          const currentPrice = 0.00; // ตัวอย่างราคา
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
