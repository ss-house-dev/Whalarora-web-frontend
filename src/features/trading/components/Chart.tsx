'use client';

import dynamic from 'next/dynamic';
import { useCoinContext } from '@/features/trading/contexts/CoinContext';
import { useEffect, useState } from 'react';

const AdvancedRealTimeChart = dynamic(
  () => import('react-ts-tradingview-widgets').then((mod) => mod.AdvancedRealTimeChart),
  { ssr: false }
);

const AdvancedChart = () => {
  const { selectedCoin } = useCoinContext();
  const [chartKey, setChartKey] = useState(0);

  // Force re-render เมื่อ selectedCoin เปลี่ยน
  useEffect(() => {
    console.log('Chart symbol changed to:', selectedCoin.value);
    setChartKey((prev) => prev + 1); // เปลี่ยน key เพื่อ force re-mount
  }, [selectedCoin.value]);

  return (
    <div key={chartKey}>
      <AdvancedRealTimeChart
        symbol={selectedCoin.value}
        allow_symbol_change={false}
        save_image={true}
        withdateranges={true}
        width="900px"
        height="540"
        theme="dark"
        interval="15"
        autosize={false}
        container_id={`chart-${chartKey}`} // unique container ID
      />
    </div>
  );
};

export default AdvancedChart;
