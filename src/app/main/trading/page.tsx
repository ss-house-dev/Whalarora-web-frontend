"use client";
import { useState } from "react";
import MarketOrderContainer from "@/features/trading/containers/OrderContainer";
import AdvancedChart from "@/features/trading/components/Chart";
import { ExampleCombobox } from "@/components/ui/combobox";

export default function MarketOrderPage() {
  const [selectedCoin, setSelectedCoin] = useState("BINANCE:BTCUSDT");

  return (
    <div className="flex justify-center mx-[120px] gap-10 mt-10">
      <div>
        <ExampleCombobox value={selectedCoin} onValueChange={setSelectedCoin} />
      </div>
      <div className="flex-1">
        <AdvancedChart />
      </div>
      <div className="bg-[#081125] rounded-lg shadow-md p-5 w-[384px] h-[504px]">
        <MarketOrderContainer />
      </div>
    </div>
  );
}
