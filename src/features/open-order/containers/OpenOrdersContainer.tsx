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

  // ใช้ pagination data จาก API แทนการคำนวณเอง
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || Math.ceil((pagination?.total || 0) / (pagination?.limit || 10));
  const totalItems = pagination?.total || orders.length;

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
            // Type assertion with fallback values - ใช้ originalAmount แทน amount
            const mappedOrder: Order = {
              id: order._id,
              side: order.side.toLowerCase() as 'buy' | 'sell',
              pair: `${order.symbol}/USDT`,
              datetime: order.createdAt || '',
              price: order.price.toString(),
              amount: order.originalAmount.toString(), // เปลี่ยนจาก order.amount เป็น order.originalAmount
              status: order.status.toLowerCase() as 'pending' | 'partial' | 'filled' | 'cancelled',
              filledAmount: (order as any).filledAmount?.toString() || '0',
              filledPercent: (order as any).filledPercent || 0,
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

      {/* Footer */}
      {showPagination && totalItems > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          {/* Total */}
          <span>Total : {totalItems} Items</span>

          {/* Pagination - แสดงเฉพาะเมื่อมีมากกว่า 1 หน้า */}
          {totalPages > 0 && (
            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                disabled={currentPage === 1}
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  currentPage === 1 ? 'text-slate-500 cursor-not-allowed' : 'text-slate-300 hover:text-white'
                }`}
                style={{ backgroundColor: '#212121' }}
              >
                ‹
              </button>

              {/* Page numbers - แสดงแค่ 3 หน้า โดยให้หน้าปัจจุบันอยู่ตรงกลาง */}
              {(() => {
                const pages = [];
                const maxVisible = 3; // แสดงแค่ 3 หน้า
                
                if (totalPages <= maxVisible) {
                  // ถ้ามีหน้าน้อยกว่าหรือเท่ากับ 3 หน้า แสดงทุกหน้า
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // ถ้ามีมากกว่า 3 หน้า แสดงแค่ 3 หน้า โดยให้หน้าปัจจุบันอยู่ตรงกลาง
                  let startPage = Math.max(1, currentPage - 1);
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                  
                  // ปรับ startPage ถ้า endPage ไม่ครบ 3 หน้า
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }
                }

                return pages.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => totalPages > 1 ? setPage(pageNum) : undefined}
                    disabled={totalPages <= 1}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                      currentPage === pageNum ? 'text-white' : 
                      totalPages <= 1 ? 'text-slate-500 cursor-not-allowed' : 'text-slate-400 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: currentPage === pageNum ? '#1F4293' : 'transparent',
                    }}
                  >
                    {pageNum}
                  </button>
                ));
              })()}

              {/* Next */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  currentPage === totalPages
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-slate-300 hover:text-white'
                }`}
                style={{ backgroundColor: '#212121' }}
              >
                ›
              </button>
            </div>
          )}
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