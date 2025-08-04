"use client";

import { useState } from "react";
import type { Transaction } from "@/app/main/trading/components/TradeHistoryTable";
import AdvancedChart from "@/app/main/trading/components/Chart";
import { Combobox } from "@/app/main/trading/components/Combobox";
import { PriceWidget } from "./components/PriceWidget";
import OrderBoxContainer from "@/app/main/trading/containers/OrderBoxContainer"; // Changed import
import React from "react";
import AlertBox from "@/components/ui/AlertBox";
import TradeHistoryTable from "@/app/main/trading/components/TradeHistoryTable";

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

  // รับธุรกรรมใหม่จาก OrderBoxContainer แล้วเพิ่มเข้า state
  const handleNewTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  return (
    <div className="flex flex-col mx-30 mt-5 gap-5 min-h-screen pb-16">
      <div className="flex gap-2">
        <div>
          <Combobox
            value={selectedSymbol}
            onValueChange={setSelectedSymbol}
          />
        </div>
        <div>
          <PriceWidget symbol={selectedSymbol} />
        </div>
      </div>
      <div className="flex-1">
        <AdvancedChart symbol={selectedSymbol} />
      </div>

      {/* ส่ง callback ให้ OrderBoxContainer */}
      <OrderBoxContainer
        mainSymbol={selectedSymbol}
        onNewTransaction={handleNewTransaction}
        onAlert={handleAlert}
      />

      <TradeHistoryTable transactions={transactions} />

      {/* แสดง AlertBox */}
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