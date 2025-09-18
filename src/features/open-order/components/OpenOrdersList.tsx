import React from 'react';
import { OpenOrder } from '../types';
import {
  useSymbolPrecisions,
  getSymbolPrecision,
  formatPriceWithTick,
  formatAmountWithStep,
} from '@/features/trading/utils/symbolPrecision';
import { formatDateTimeWithMonthAbbr } from '@/features/trading/utils/dateFormat';

interface OpenOrdersListProps {
  orders: OpenOrder[];
  loading?: boolean;
  onCancelOrder?: (payload: { orderRef: string; side: 'BUY' | 'SELL' }) => void;
}

function parsePairParts(rawSymbol: string): { base: string; quote: string; display: string } {
  const symbol = rawSymbol?.trim() ?? '';
  if (!symbol) return { base: '', quote: 'USDT', display: '/USDT' };

  const separators = ['/', '-', '_'];
  for (const sep of separators) {
    if (symbol.includes(sep)) {
      const [baseRaw = '', quoteRaw = 'USDT'] = symbol.split(sep);
      const base = baseRaw.toUpperCase();
      const quote = quoteRaw.toUpperCase() || 'USDT';
      return { base, quote, display: `${base}/${quote}` };
    }
  }

  const upper = symbol.toUpperCase();
  if (upper.endsWith('USDT')) {
    const base = upper.slice(0, -4);
    return { base, quote: 'USDT', display: `${base}/USDT` };
  }

  return { base: upper, quote: 'USDT', display: `${upper}/USDT` };
}

export const OpenOrdersList: React.FC<OpenOrdersListProps> = ({
  orders,
  loading = false,
  onCancelOrder,
}) => {
  const { data: precisionMap } = useSymbolPrecisions();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              วันที่/เวลา
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              คู่เทรด
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ประเภท
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ราคา
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              จำนวน
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              จำนวนเดิม
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              สถานะ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              การกระทำ
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => {
            const pair = parsePairParts(order.symbol);
            const precision = precisionMap
              ? getSymbolPrecision(precisionMap, pair.base, pair.quote)
              : undefined;
            const formattedPrice = formatPriceWithTick(order.price, precision, {
              locale: 'en-US',
              fallbackDecimals: 2,
            });
            const formattedAmount = formatAmountWithStep(order.amount, precision, {
              locale: 'en-US',
              fallbackDecimals: 6,
            });
            const formattedOriginalAmount = formatAmountWithStep(order.originalAmount, precision, {
              locale: 'en-US',
              fallbackDecimals: 6,
            });

            return (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDateTimeWithMonthAbbr(order.createdAt, { includeSeconds: true })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pair.display}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.side === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {order.side === 'BUY' ? 'ซื้อ' : 'ขาย'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formattedPrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formattedAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formattedOriginalAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {onCancelOrder && (
                    <button
                      onClick={() => onCancelOrder({ orderRef: order.orderRef, side: order.side })}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      ยกเลิก
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// components/OpenOrdersPagination.tsx
interface OpenOrdersPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const OpenOrdersPagination: React.FC<OpenOrdersPaginationProps> = ({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  const limitOptions = [5, 10, 20, 50];

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">แสดง</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          {limitOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-700">จาก {total} รายการ</span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          ก่อนหน้า
        </button>

        <span className="text-sm text-gray-700">
          หน้า {currentPage} จาก {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
};
