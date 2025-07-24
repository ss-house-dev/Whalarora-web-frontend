'use client'

import { useState } from "react";
import { ExampleCombobox } from "@/components/ui/example-combobox";
import { PriceWidget } from "@/components/ui/PriceWidget";
import Chart from "@/components/ui/chart";

export default function TradePage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");

  return (
    <div className="flex flex-col mx-30 mt-5 gap-5 h-full">
      <div className="flex gap-2">
        <div>
          <ExampleCombobox
            value={selectedSymbol}
            onValueChange={setSelectedSymbol}
          />
        </div>
        <div>
          <PriceWidget symbol={selectedSymbol} />
        </div>
      </div>
      <div className="flex-1">
        <Chart symbol={selectedSymbol} />
      </div>
    </div>
  );
}
