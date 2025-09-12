import { useState } from 'react';
import PaginationFooter from '@/components/ui/PaginationFooter';

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

      {/* Footer - unified pagination */}
      <PaginationFooter
        page={page}
        totalPages={totalPages || 1}
        totalCount={orders.length}
        label="Items"
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
