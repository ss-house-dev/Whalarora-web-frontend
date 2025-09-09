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
    setPage,
  } = useOpenOrders();

  // ใช้ pagination data จาก API แทนการคำนวณเอง
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || Math.ceil((pagination?.total || 0) / (pagination?.limit || 10));
  const totalItems = pagination?.total || orders.length;

  return (
    <div className="flex flex-col h-full">
      {/* Order list */}
      <div className="flex-1 overflow-y-auto pr-2">
        {orders.length === 0 ? (
          <div className="text-slate-400 text-sm flex justify-center items-center h-8">
            No open order
          </div>
        ) : (
          orders.map((order) => {
            // Type assertion with fallback values
            const remainingAmount = order.amount; // amount คือจำนวนที่เหลือ
            const originalAmount = order.originalAmount; // originalAmount คือจำนวนเดิม
            const filledAmount = originalAmount - remainingAmount; // จำนวนที่ fill แล้ว
            const filledPercent = originalAmount > 0 ? (filledAmount / originalAmount) * 100 : 0;

            const mappedOrder: Order = {
              id: order._id,
              side: order.side.toLowerCase() as 'buy' | 'sell',
              pair: `${order.symbol}/USDT`,
              datetime: order.createdAt || '',
              price: order.price.toString(),
              amount: order.originalAmount.toString(), // Amount ที่แสดงใช้ originalAmount
              status: order.status.toLowerCase() as 'pending' | 'partial' | 'filled' | 'cancelled',
              filledAmount: filledAmount.toString(), // Filled ใช้ originalAmount - amount
              filledPercent: filledPercent, // คำนวณเปอร์เซ็นต์จาก (originalAmount - amount) / originalAmount
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

      {/* Footer - แสดงเสมอ */}
      {showPagination && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          {/* Total */}
          <span>Total : {totalItems} Items</span>

          {/* Pagination - แสดงเสมอ */}
          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              disabled={currentPage === 1 || totalPages === 0}
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                currentPage === 1 || totalPages === 0 ? 'text-slate-500 cursor-not-allowed' : 'text-slate-300 hover:text-white'
              }`}
              style={{ backgroundColor: '#212121' }}
            >
              ‹
            </button>

            {/* Page numbers - แสดงทุกหน้า หรืออย่างน้อย 1 หน้า */}
            {totalPages > 0 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                    currentPage === pageNum ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: currentPage === pageNum ? '#1F4293' : 'transparent',
                  }}
                >
                  {pageNum}
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
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                currentPage === totalPages || totalPages === 0
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
    <div className={`h-full ${className}`}>
      <OpenOrdersProvider>
        <OpenOrdersContent {...props} />
      </OpenOrdersProvider>
    </div>
  );
};

export default OpenOrdersContainer;