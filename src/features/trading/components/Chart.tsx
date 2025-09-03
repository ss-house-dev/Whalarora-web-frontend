"use client";
import dynamic from "next/dynamic";

const AdvancedRealTimeChart = dynamic(
  () => import("react-ts-tradingview-widgets").then((mod) => mod.AdvancedRealTimeChart),
  { ssr: false }
);

interface AdvancedChartProps {
  symbol: string;
}

const AdvancedChart = ({ symbol }: AdvancedChartProps) => {
  return (
    <div className="w-full h-[600px] pr-[1px] rounded-2xl">
      <AdvancedRealTimeChart
        symbol={symbol}
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