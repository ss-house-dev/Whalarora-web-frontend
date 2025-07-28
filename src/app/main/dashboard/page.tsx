"use client";

import { useState } from "react";
import { ExampleCombobox } from "@/components/ui/example-combobox";
import { PriceWidget } from "@/components/ui/PriceWidget";
import Chart from "@/components/ui/chart";
import OrderBox from '@/components/ui/OrderBox';
import TradeHistoryTable, { Transaction } from "@/components/ui/TradeHistoryTable";
import React from 'react';

export default function TradePage() {
    const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");
    const [coin, setCoin] = useState("BTC");

    // state สำหรับเก็บธุรกรรมทั้งหมด
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // รับธุรกรรมใหม่จาก OrderBox แล้วเพิ่มเข้า state
    const handleNewTransaction = (tx: Transaction) => {
        setTransactions(prev => [tx, ...prev]);
    };

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

            {/* ส่ง callback ให้ OrderBox */}
            <OrderBox
                mainSymbol={selectedSymbol}
                onNewTransaction={handleNewTransaction}
            />

            {/* แสดงประวัติการซื้อขาย */}
            <TradeHistoryTable transactions={transactions} />
        </div>
    );
}
