// ตัวอย่าง: dashboard page
"use client";

import { useState } from "react";
import { ExampleCombobox } from "@/components/ui/example-combobox";
import { PriceWidget } from "@/components/ui/PriceWidget";
import Chart from "@/components/ui/chart";
import OrderBox from '@/components/ui/OrderBox';
import React from 'react';
import TradeHistoryTable from "@/components/TradeHistoryTable";

export default function TradePage() {
    const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");
    const [coin, setCoin] = useState("BTC"); // จะให้เปลี่ยนอะไรก็เปลี่ยน coin

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

            <OrderBox mainSymbol={selectedSymbol} />

            <button className="hover:bg-red-300">test</button>


            <TradeHistoryTable />


        </div>


    );
}


