"use client";

import { useState } from "react";
import type { Transaction } from "@/features/trading/components/TradeHistoryTable";
import AdvancedChart from "@/features/trading/components/Chart";
import { Combobox } from "@/features/trading/components/Combobox";
import { PriceWidget } from "../../../features/trading/components/PriceWidget";
import OrderBoxContainer from "@/features/trading/containers/OrderBoxContainer"; 
import React from "react";
import AlertBox from "@/features/trading/components/AlertBox";
import TradeHistoryTable from "@/features/trading/components/TradeHistoryTable";

export default function TradePage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [alert, setAlert] = useState<{
    title: string;
    message: React.ReactNode;
  } | null>(null);

  const handleAlert = (title: string, message: React.ReactNode) => {
    setAlert({ title, message });
  };

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