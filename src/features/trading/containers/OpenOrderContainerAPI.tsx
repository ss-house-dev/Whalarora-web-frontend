import { useEffect, useMemo, useState } from 'react';
import OrderCard, { Order } from './OrderCard';

type ApiOrder = {
  id: string;
  side: 'buy' | 'sell';
  symbol: string; // เน€เธเนเธ "BTC/USDT"
  createdAt: string; // ISO string
  price: number; // 120000
  amount: number; // 0.02
  status: 'pending' | 'partial' | 'filled' | 'cancelled';
  filledAmount?: number; // 0.01
  filledPercent?: number; // 50
};

type OrdersResponse = {
  data: ApiOrder[];
  page: number;
  perPage: number;
  total: number; // เน€เธญเธฒเนเธงเนเธเธณเธเธงเธ“ totalPages
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';
const PER_PAGE = 10;

export default function OpenOrderContainer() {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // เนเธเธฅเธเธเนเธญเธกเธนเธฅเธซเธฅเธฑเธเธเนเธฒเธเนเธซเนเน€เธเนเธฒเธเธฑเธschema Order เธเธญเธ UI เน€เธ”เธดเธก
  const mapToOrder = (o: ApiOrder): Order => ({
    id: o.id,
    side: o.side,
    pair: o.symbol,
    datetime: formatDateTime(o.createdAt),
    price: o.price.toString(),
    amount: o.amount.toString(),
    status: o.status,
    filledAmount:
      o.status === 'partial' && o.filledAmount != null
        ? o.filledAmount.toString() : undefined,
    filledPercent: o.status === 'partial' ? (o.filledPercent ?? 0) : undefined,
  });

  // เธ”เธถเธเธเนเธญเธกเธนเธฅเน€เธกเธทเนเธญ page เน€เธเธฅเธตเนเธขเธ
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${API_BASE}/orders?status=open&page=${page}&perPage=${PER_PAGE}`, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const json: OrdersResponse = await res.json();
        setOrders(json.data.map(mapToOrder));
        setTotal(json.total);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
        setErr(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PER_PAGE)), [total]);

  const handleDelete = async (id: string) => {
    // optimistic update
    const prev = orders;
    setOrders((p) => p.filter((o) => o.id !== id));
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      // เธฅเธเธชเธณเน€เธฃเนเธ โ€” เนเธกเนเธกเธตเธญเธฐเนเธฃเน€เธเธดเนเธก เธซเธฃเธทเธญเธญเธฒเธเธเธฐเธกเธตเนเธเนเธเน€เธ•เธทเธญเธเธงเนเธฒเธเธ”เธฅเธ เนเธกเนเธฃเธนเน
      // เธญเธฒเธ refetch เธซเธเนเธฒเธเธตเนเธญเธตเธเธเธฃเธฑเนเธ เน€เธเธทเนเธญเธซเธฅเธฑเธเธเนเธฒเธเน€เธเธฅเธตเนเธขเธ total
      setTotal((t) => Math.max(0, t - 1));
    } catch {
      // rollback เธ–เนเธฒเธฅเธเนเธกเนเธเนเธฒเธ
      setOrders(prev);
      alert('เธฅเธเธเธณเธชเธฑเนเธเนเธกเนเธชเธณเน€เธฃเนเธ');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* เน€เธเธทเนเธญเธซเธฒ container */}
      <div className="flex-1 overflow-y-auto pr-2">
        {loading ? (
          <div className="text-slate-400 text-sm flex justify-center items-center h-full">
            Loading...
          </div>
        ) : err ? (
          <div className="text-red-400 text-sm flex justify-center items-center h-full">{err}</div>
        ) : orders.length === 0 ? (
          <div className="text-slate-400 text-sm flex justify-center items-center h-full">
            No open order
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} onDelete={handleDelete} />)
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Total : {total} Items</span>
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              page === 1 ? 'text-slate-500 cursor-not-allowed' : 'text-slate-300 hover:text-white'
            }`}
            style={{ backgroundColor: '#212121' }}
          >
            โ€น
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              page === totalPages
                ? 'text-slate-500 cursor-not-allowed'
                : 'text-slate-300 hover:text-white'
            }`}
            style={{ backgroundColor: '#212121' }}
          >
            โ€บ
          </button>
        </div>
      </div>
    </div>
  );
}

/** ===== helpers ===== */
function formatDateTime(iso: string) {
  // เน€เธงเธฅเธฒเนเธเธเน€เธ”เธดเธก"13-08-2025 14:30"
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}





