import React from 'react';
import { OpenOrdersProvider, useOpenOrders } from '../contexts/OpenOrdersContext';
import OrderCard, { Order } from '../components/OrderCard';

interface OpenOrdersContainerProps {
  className?: string;
  showPagination?: boolean;
  showRefreshButton?: boolean;
  onCancelOrder?: (orderId: string) => void;
}

const OpenOrdersContent: React.FC<Omit<OpenOrdersContainerProps, 'className'>> = ({
  showPagination = true,
  onCancelOrder,
}) => {
  const {
    orders,
    pagination,
    loading,
    error,
    refreshOrders,
    setPage,
    setLimit,
  } = useOpenOrders();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-red-800 font-medium">เกิดข้อผิดพลาด</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={refreshOrders}
            className="text-red-800 hover:text-red-900 font-medium text-sm"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Order list */}
      <div className="flex-1 overflow-y-auto pr-2">
        {orders.length === 0 ? (
          <div className="text-slate-400 text-sm flex justify-center items-center h-full">
            No open order
          </div>
        ) : (
          orders.map((order) => {
            // Type assertion with fallback values
            const mappedOrder: Order = {
              id: order._id,
              side: order.side.toLowerCase() as 'buy' | 'sell',
              pair: `${order.symbol}/USDT`,
              datetime: order.createdAt || '',
              price: order.price.toString(),
              amount: order.amount.toString(),
              status: order.status.toLowerCase() as 'pending' | 'partial' | 'filled' | 'cancelled',
              filledAmount: (order as any).filledAmount?.toString() || '0', // Type assertion with fallback
              filledPercent: (order as any).filledPercent || 0, // Type assertion with fallback
              _id: order._id,
              symbol: order.symbol,
              createdAt: order.createdAt,
            };
            return (
              <OrderCard
                key={order._id}
                order={mappedOrder}
                onDelete={onCancelOrder ? () => onCancelOrder(order._id) : undefined}
              />
            );
          })
        )}
      </div>

      {/* Pagination */}
      {showPagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          {/* Total */}
          <span>Total : {pagination.total} Items</span>

          {/* Pagination */}
          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              disabled={pagination.page === 1}
              onClick={() => setPage(pagination.page - 1)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                pagination.page === 1
                  ? 'text-slate-500 cursor-not-allowed'
                  : 'text-slate-300 hover:text-white'
              }`}
              style={{ backgroundColor: '#212121' }}
            >
              ‹
            </button>

            {/* Visible pages */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                  pagination.page === p ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
                style={{
                  backgroundColor: pagination.page === p ? '#1F4293' : 'transparent',
                }}
              >
                {p}
              </button>
            ))}

            {/* Next */}
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                pagination.page === pagination.totalPages
                  ? 'text-slate-500 cursor-not-allowed'
                  : 'text-slate-300 hover:text-white'
              }`}
              style={{ backgroundColor: '#212121' }}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const OpenOrdersContainer: React.FC<OpenOrdersContainerProps> = ({
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      <OpenOrdersProvider>
        <OpenOrdersContent {...props} />
      </OpenOrdersProvider>
    </div>
  );
};