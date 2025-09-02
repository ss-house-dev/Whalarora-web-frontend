"use client";
import { useState } from "react";
import MarketOrderContainer from "@/features/trading/containers/OrderContainer";
import AdvancedChart from "@/features/trading/components/Chart";
import { ExampleCombobox } from "@/components/ui/combobox";

export default function MarketOrderPage() {
  const [selectedCoin, setSelectedCoin] = useState("BINANCE:BTCUSDT");

  return (
    <div className="mx-[120px] mt-[20px] space-y-[20px] min-h-screen">
      {/* Combobox at the top */}
      <div>
        <ExampleCombobox value={selectedCoin} onValueChange={setSelectedCoin} />
      </div>

      {/* Chart and Order Container side by side */}
      <div className="flex gap-10">
        <div className="flex-1">
          <AdvancedChart />
        </div>
        <div className="bg-[#081125] rounded-lg shadow-md p-5 w-[384px] h-[504px]">
          <MarketOrderContainer />
        </div>
      </div>
    </div>
  );
}
