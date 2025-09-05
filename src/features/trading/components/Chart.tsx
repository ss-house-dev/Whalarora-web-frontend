"use client";

import dynamic from "next/dynamic";
import { useCoinContext } from "@/features/trading/contexts/CoinContext";

const AdvancedRealTimeChart = dynamic(
  () => import("react-ts-tradingview-widgets").then((mod) => mod.AdvancedRealTimeChart),
  { ssr: false }
);

const AdvancedChart = () => {
  const { selectedCoin } = useCoinContext();

  return (
      <AdvancedRealTimeChart
        symbol={selectedCoin.value}
        allow_symbol_change={false}
        save_image={true}
        withdateranges={true}
        width="900px"
        height="540" 
        theme="dark"
        interval="1"  
      />
  );
};

export default AdvancedChart;