"use client";
import { use } from "react";    
// DevOrderCardPreview.tsx
import OrderCard, { Order } from "./OrderCard";

export default function DevOrderCardPreview() {
  const order: Order = {
    id: "x1",
    side: "buy",
    pair: "BTC/USDT",
    datetime: "01-09-2025 12:34",
    price: "123,456.78 USD",
    amount: "0.012345678 BTC",
    status: "partial",
    filledAmount: "0.006000000 BTC",
    filledPercent: 48,
  };
  return <div className="p-4"> <OrderCard order={order} onDelete={() => {}} /></div>;
}
