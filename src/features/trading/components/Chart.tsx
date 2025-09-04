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
    <div className="w-full h-[600px] pr-[1px] rounded-2xl">
      <AdvancedRealTimeChart
        symbol={selectedCoin.value}
        allow_symbol_change={false}
        save_image={true}
        withdateranges={true}
        width="100%"
        height={600}
        theme="dark"
        interval="1"
        autosize={true}
      />
    </div>
  );
};

export default AdvancedChart;