import { useState } from "react";
import OrderCard, { Order } from "./OrderCard";

export default function OpenOrderContainer() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      side: "buy",
      pair: "BTC/USDT",
      datetime: "13-08-2025 14:30",
      price: "120,000.00 USD",
      amount: "0.020000000 BTC",
      status: "partial",
      filledAmount: "0.010000000 BTC",
      filledPercent: 50,
    },
    {
      id: "2",
      side: "buy",
      pair: "BTC/USDT",
      datetime: "13-08-2025 14:30",
      price: "120,000.00 USD",
      amount: "0.020000000 BTC",
      status: "pending",
    },
    {
      id: "3",
      side: "buy",
      pair: "BTC/USDT",
      datetime: "13-08-2025 14:30",
      price: "120,000.00 USD",
      amount: "0.020000000 BTC",
      status: "pending",
    },
    {
      id: "4",
      side: "buy",
      pair: "BTC/USDT",
      datetime: "13-08-2025 14:30",
      price: "120,000.00 USD",
      amount: "0.020000000 BTC",
      status: "pending",
    },
  ]);

  const handleDelete = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  return (
    <div className="w-full h-full overflow-y-auto pr-2">
      {orders.length === 0 ? (
        <div className="text-slate-400 text-sm flex justify-center items-center h-full">
          No open order
        </div>
      ) : (
        orders.map((order) => (
          <OrderCard key={order.id} order={order} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
}
