'use client'

import { useState } from "react";
import { ExampleCombobox } from "@/components/ui/example-combobox";
import Chart from "@/components/ui/chart";
import { PriceWidget } from "@/components/ui/PriceWidget";

export default function TradePage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <ExampleCombobox 
              value={selectedSymbol} 
              onValueChange={setSelectedSymbol}
            />
            <PriceWidget symbol={selectedSymbol} />
          </div>
        </div>
        <div className="lg:col-span-3">
          <Chart symbol={selectedSymbol} />
        </div>
      </div>
    </div>
  );
}