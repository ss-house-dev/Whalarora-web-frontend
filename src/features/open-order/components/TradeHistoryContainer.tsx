import { useState } from 'react';

// Order type definition
export interface Order {
  id: string;
  side: 'buy' | 'sell';
  pair: string;
  datetime: string;
  price: string;
  amount: string;
  status: 'filled' | 'cancelled';
}

// OrderCard component with proper typing
const OrderCard = ({ order }: { order: Order }) => (
  <div className="p-3 border-b border-slate-700">
    <div className="text-sm text-white">{order.pair}</div>
  </div>
);

export default function TradeHistoryContainer() {
  const [page, setPage] = useState(1);
  const perPage = 10;

  // เปลี่ยนจากการสร้างข้อมูลตัวอย่างเป็น array ว่าง
  const [orders] = useState<Order[]>([]);

  const totalPages = Math.ceil(orders.length / perPage);
  const currentOrders = orders.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="flex flex-col h-full">
      {/* Order list */}
      <div className="flex-1 overflow-y-auto pr-2">
        {currentOrders.length === 0 ? (
          <div className="text-slate-400 text-sm flex justify-center items-center h-8">
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
            disabled={page === 1 || totalPages === 0}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              page === 1 || totalPages === 0 ? 'text-slate-500 cursor-not-allowed' : 'text-slate-300 hover:text-white'
            }`}
            style={{ backgroundColor: '#212121' }}
          >
            ‹
          </button>

          {/* Visible pages */}
          {totalPages > 0 ? (
            Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                  page === p ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
                style={{
                  backgroundColor: page === p ? '#1F4293' : 'transparent',
                }}
              >
                {p}
              </button>
            ))
          ) : (
            <button
              disabled
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-slate-500 cursor-not-allowed"
              style={{ backgroundColor: 'transparent' }}
            >
              1
            </button>
          )}

          {/* Next */}
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              page === totalPages || totalPages === 0
                ? 'text-slate-500 cursor-not-allowed'
                : 'text-slate-300 hover:text-white'
            }`}
            style={{ backgroundColor: '#212121' }}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}