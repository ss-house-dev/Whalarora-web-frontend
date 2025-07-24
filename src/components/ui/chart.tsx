"use client";

import dynamic from "next/dynamic";

const AdvancedRealTimeChart = dynamic(
  () =>
    import("react-ts-tradingview-widgets").then(
      (mod) => mod.AdvancedRealTimeChart
    ),
  { ssr: false }
);

interface ChartProps {
  symbol: string;
}

const AdvancedChart = ({ symbol }: ChartProps) => {
  return (
    <div className="w-full h-[600px] pr-[1px]">
      <AdvancedRealTimeChart
        symbol={symbol || "BINANCE:BTCUSDT"}
        allow_symbol_change={false}
        save_image={true}
        withdateranges={true}
        width="100%"
        height={600}
        // autosize={true}
        key={symbol} // เพิ่ม key เพื่อให้ component re-render เมื่อ symbol เปลี่ยน
      />
    </div>
  );
};

export default AdvancedChart;
