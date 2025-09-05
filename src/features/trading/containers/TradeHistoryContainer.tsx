import { useState } from "react";
import OrderCard, { Order } from "./OrderCard";

export default function TradeHistoryContainer() {
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [orders] = useState<Order[]>(
    Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      side: i % 2 === 0 ? "buy" : "sell",
      pair: "BTC/USDT",
      datetime: "13-08-2025 14:30",
      price: "120,000.00 USD",
      amount: "0.010000000 BTC",
      status: i % 3 === 0 ? "filled" : "cancelled",
    }))
  );

  const totalPages = Math.ceil(orders.length / perPage);
  const currentOrders = orders.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="flex flex-col h-full">
      {/* Order list */}
      <div className="flex-1 overflow-y-auto pr-2">
        {currentOrders.length === 0 ? (
          <div className="text-slate-400 text-sm flex justify-center items-center h-full">
            No trade history
          </div>
        ) : (
          currentOrders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        {/* Total */}
        <span>Total : {orders.length} Items</span>

        {/* Pagination */}
        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              page === 1
                ? "text-slate-500 cursor-not-allowed"
                : "text-slate-300 hover:text-white"
            }`}
            style={{ backgroundColor: "#212121" }}
          >
            ‹
          </button>

          {/* Visible pages */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                page === p ? "text-white" : "text-slate-400 hover:text-white"
              }`}
              style={{
                backgroundColor: page === p ? "#1F4293" : "transparent",
              }}
            >
              {p}
            </button>
          ))}

          {/* Next */}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              page === totalPages
                ? "text-slate-500 cursor-not-allowed"
                : "text-slate-300 hover:text-white"
            }`}
            style={{ backgroundColor: "#212121" }}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
