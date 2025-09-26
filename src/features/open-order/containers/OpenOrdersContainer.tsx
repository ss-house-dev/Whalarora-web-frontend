import React from 'react';
import { OpenOrdersProvider, useOpenOrders } from '../contexts/OpenOrdersContext';
import { formatDateTimeWithMonthAbbr } from '@/features/trading/utils/dateFormat';
import OrderCard, { Order } from '../components/OrderCard';
import PaginationFooter from '@/components/ui/PaginationFooter';
import { OpenOrdersState } from '../types';
import { useIsMobile } from '@/hooks/use-mobile';

interface OpenOrdersContainerProps {
  className?: string;
  showPagination?: boolean;
  showRefreshButton?: boolean;
  onCancelOrder?: (payload: { orderRef: string; side: 'BUY' | 'SELL' }) => void;
}

const normalizeOrderStatus = (status: string | undefined | null): Order['status'] => {
  const normalized = status ? String(status).trim().toUpperCase() : '';
  switch (normalized) {
    case 'OPEN':
    case 'PENDING':
    case 'ACTIVE':
      return 'pending';
    case 'PARTIALLY_FILLED':
    case 'PARTIAL':
    case 'PARTIALLYFILLED':
      return 'partial';
    case 'FILLED':
    case 'COMPLETED':
    case 'MATCHED':
      return 'filled';
    case 'CANCELLED':
    case 'CANCELED':
    case 'CLOSED':
      return 'cancelled';
    default:
      return 'pending';
  }
};

const OpenOrdersContent: React.FC<Omit<OpenOrdersContainerProps, 'className'>> = ({
  showPagination = true,
  onCancelOrder,
}) => {
  const { orders, pagination, setPage, loading, error } = useOpenOrders();
  const isMobile = useIsMobile();

  // เก็บ pagination ก่อนหน้าไว้แสดงระหว่าง loading
  const [prevPagination, setPrevPagination] = React.useState<OpenOrdersState['pagination'] | null>(
    null
  );

  // Fade-in animation on every page switch
  const [pageMounted, setPageMounted] = React.useState(false);

  // อัปเดตค่าก่อนหน้าเมื่อโหลดเสร็จและมีข้อมูลใหม่
  React.useEffect(() => {
    if (!loading && pagination) {
      setPrevPagination(pagination);
    }
  }, [loading, pagination]);

  React.useEffect(() => {
    setPageMounted(false);
    const id = requestAnimationFrame(() => setPageMounted(true));
    return () => cancelAnimationFrame(id);
  }, [pagination?.page]);

  // Early return after all hooks have been called
  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-500">
        Failed to load open orders. Please log in.
      </div>
    );
  }

  // ใช้ pagination data จาก API หรือค่าก่อนหน้าถ้ากำลัง loading
  const displayPagination = loading && prevPagination ? prevPagination : pagination;
  const currentPage = displayPagination?.page || 1;
  const totalPages =
    pagination?.totalPages || Math.ceil((pagination?.total || 0) / (pagination?.limit || 10));
  const totalItems = pagination?.total || orders.length;

  return (
    <div className="flex flex-col h-full">
      {/* Order list */}

      <div
        className={`relative flex-1 overflow-y-auto ${isMobile ? 'pt-2 pr-0' : 'pr-2'} transition-opacity duration-300 ${
          loading ? 'opacity-60' : 'opacity-100'
        }`}
      >
        {/* Orders list (kept mounted so pagination stays stable during loading) */}
        {!loading && orders.length === 0 ? (
          <div className="text-slate-400 text-sm flex justify-center items-center py-6 text-center">
            No open order
          </div>
        ) : (
          <div
            className={`flex flex-col gap-1.5 transition-opacity duration-300 ease-out ${
              pageMounted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {orders.map((order, idx) => {
              // Type assertion with fallback values
              const remainingAmount = order.amount; // amount คือจำนวนที่เหลือ
              const originalAmount = order.originalAmount; // originalAmount คือจำนวนเดิม
              const filledAmount = originalAmount - remainingAmount; // จำนวนที่ fill แล้ว
              const filledPercent = originalAmount > 0 ? (filledAmount / originalAmount) * 100 : 0;

              const mappedOrder: Order = {
                id: order._id,
                side: order.side.toLowerCase() as 'buy' | 'sell',
                pair: `${order.symbol}/USDT`,
                datetime: formatDateTimeWithMonthAbbr(order.createdAt, { includeSeconds: false }),
                price: order.price.toString(),
                amount: order.originalAmount.toString(), // Amount ที่แสดงใช้ originalAmount
                status: normalizeOrderStatus(order.status),
                filledAmount: filledAmount.toString(), // Filled ใช้ originalAmount - amount
                filledPercent: filledPercent, // คำนวณเปอร์เซ็นต์จาก (originalAmount - amount) / originalAmount
                _id: order._id,
                symbol: order.symbol,
                createdAt: order.createdAt,
              };
              return (
                <div
                  key={order._id}
                  className={`transform transition-all duration-300 ease-out ${
                    pageMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                  style={{ transitionDelay: pageMounted ? `${idx * 40}ms` : '0ms' }}
                >
                  <OrderCard
                    order={mappedOrder}
                    onDelete={
                      onCancelOrder
                        ? () => onCancelOrder({ orderRef: order.orderRef, side: order.side })
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent transition-opacity duration-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Footer - แสดงเสมอ */}
      {showPagination && (
        <PaginationFooter
          page={currentPage}
          totalPages={totalPages}
          totalCount={totalItems}
          label="Items"
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
};

export const OpenOrdersContainer: React.FC<OpenOrdersContainerProps> = ({
  className = '',
  ...props
}) => {
  return (
    <div className={`h-full ${className}`}>
      <OpenOrdersProvider>
        <OpenOrdersContent {...props} />
      </OpenOrdersProvider>
    </div>
  );
};

export default OpenOrdersContainer;
