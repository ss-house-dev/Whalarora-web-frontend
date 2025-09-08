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
  showRefreshButton = true,
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
    autoRefresh,
    toggleAutoRefresh,
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
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            คำสั่งซื้อที่เปิดอยู่
          </h2>
          <div className="flex items-center space-x-3">
            {/* Auto Refresh Toggle */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={toggleAutoRefresh}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="text-sm text-gray-600">อัปเดตอัตโนมัติ</span>
            </label>

            {/* Manual Refresh Button */}
            {showRefreshButton && (
              <button
                onClick={refreshOrders}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg
                  className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                รีเฟรช
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            ทั้งหมด {pagination.total} รายการ
            {loading && <span className="ml-2 text-blue-600">กำลังโหลด...</span>}
          </p>
        </div>
      </div>

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