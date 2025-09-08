import React from 'react';
import { OpenOrdersProvider, useOpenOrders } from '../contexts/OpenOrdersContext';
import { OpenOrdersList, OpenOrdersPagination } from '../components/OpenOrdersList';

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

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Orders List */}
      <OpenOrdersList
        orders={orders}
        loading={loading}
        onCancelOrder={onCancelOrder}
      />

      {/* Pagination */}
      {showPagination && pagination.totalPages > 1 && (
        <OpenOrdersPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
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
    <div className={className}>
      <OpenOrdersProvider>
        <OpenOrdersContent {...props} />
      </OpenOrdersProvider>
    </div>
  );
};