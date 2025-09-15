import { useMemo, useState } from 'react';
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

type FilterKey = 'all' | 'today' | 'month' | 'year';

export default function TradeHistoryContainer() {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [filter, setFilter] = useState<FilterKey>('all');

  // เปลี่ยนจากการสร้างข้อมูลตัวอย่างเป็น array ว่าง
  const [orders] = useState<Order[]>([]);

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    const now = new Date();
    return orders.filter((o) => {
      const d = new Date(o.datetime);
      if (Number.isNaN(d.getTime())) return false;
      if (filter === 'today') {
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      }
      if (filter === 'month') {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }
      // year
      return d.getFullYear() === now.getFullYear();
    });
  }, [orders, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentOrders = useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page]
  );

  // รีเซ็ตหน้าเมื่อกรองเปลี่ยน
  const handleSetFilter = (key: FilterKey) => {
    setFilter(key);
    setPage(1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters (12px below divider) styled from Figma */}
      <div className="mt-0 mb-2 pl-1">
        <div className="w-72 py-1 rounded-xl inline-flex justify-start items-start gap-2.5">
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'today', label: 'Today' },
              { key: 'month', label: 'Month' },
              { key: 'year', label: 'Year' },
            ] as { key: FilterKey; label: string }[]
          ).map(({ key, label }) => {
            const isActive = filter === key;
            return (
              <button
                key={key}
                onClick={() => handleSetFilter(key)}
                className={`${
                  isActive
                    ? 'outline outline-1 outline-offset-[-1px] outline-[#474747]'
                    : ''
                } w-16 h-6 px-2 py-1 rounded-3xl flex justify-center items-center`}
                aria-pressed={isActive}
              >
                <span
                  className={`${
                    isActive
                      ? 'text-white'
                      : 'text-[#A4A4A4]'
                  } text-sm font-normal font-[Alexandria] leading-tight`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

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
        totalPages={totalPages}
        totalCount={filtered.length}
        label="Items"
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
