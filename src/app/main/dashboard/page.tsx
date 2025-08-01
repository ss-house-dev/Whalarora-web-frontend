"use client";

import { useState } from "react";
import { ExampleCombobox } from "@/components/ui/example-combobox";
import { PriceWidget } from "@/components/ui/PriceWidget";
import Chart from "@/components/ui/chart";
import OrderBox from "@/components/ui/OrderBox";
import TradeHistoryTable, {
  Transaction,
} from "@/components/ui/TradeHistoryTable";
import React from "react";
import AlertBox from "@/components/ui/AlertBox";

export default function TradePage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");
  const [coin, setCoin] = useState("BTC");

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // --------- สำหรับ AlertBox ---------
  const [alert, setAlert] = useState<{
    title: string;
    message: React.ReactNode;
  } | null>(null);

  const handleAlert = (title: string, message: React.ReactNode) => {
    setAlert({ title, message });
  };

  // รับธุรกรรมใหม่จาก OrderBox แล้วเพิ่มเข้า state
  const handleNewTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
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
        onAlert={handleAlert}
      />

      {/* แสดงประวัติการซื้อขาย */}
      <TradeHistoryTable transactions={transactions} />

      {/* แสดง AlertBox ถ้ามี alert */}
      {alert && (
        <AlertBox
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
}
