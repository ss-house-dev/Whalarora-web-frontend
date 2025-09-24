'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { OpenOrdersContainer } from '../containers/OpenOrdersContainer';
import TradeHistoryContainer from './TradeHistoryContainer';
import { useIsMobile } from '@/hooks/use-mobile';
import { OpenOrdersProvider, useOpenOrders } from '../contexts/OpenOrdersContext';
import { useGetTradeHistory } from '../hooks/useGetTradeHistory';
import type { TradeHistoryRange } from '../types/history';
import { formatDateParts } from '@/features/trading/utils/dateFormat';
import PaginationFooter from '@/components/ui/PaginationFooter';

// --- Type Definitions ---
type OrderStatus = 'complete' | 'partial' | 'pending' | 'closed';
type OrderSide = 'buy' | 'sell';

interface OrderPreview {
  id: string;
  status: OrderStatus;
  side: OrderSide;
  pair: string;
  date: string;
  time: string;
  price: string;
  priceCurrency: string;
  quantityLabel: string;
  quantity: string;
  quantityUnit: string;
  filledAmount?: string;
  filledUnit?: string;
  filledPercent?: number;
  cancellable?: boolean;
}

interface HistoryPreview {
  id: string;
  status: Extract<OrderStatus, 'complete' | 'closed'>;
  side: OrderSide;
  pair: string;
  date: string;
  time: string;
  orderId: string;
  amount: string;
  baseSymbol: string;
  price: string;
  priceCurrency: string;
}

// --- Metadata Constants ---
const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; dotColor: string; textColor: string }
> = {
  complete: { label: 'Complete', dotColor: '#4ED7B0', textColor: '#4ED7B0' },
  partial: { label: 'Partially Filled', dotColor: '#FFD477', textColor: '#FFD477' },
  pending: { label: 'Pending', dotColor: '#215EEC', textColor: '#6F8BFF' },
  closed: { label: 'Closed', dotColor: '#474747', textColor: '#A4A4A4' },
};

const ORDER_SIDE_META: Record<OrderSide, { label: string; badgeColor: string }> = {
  buy: { label: 'Buy', badgeColor: '#217871' },
  sell: { label: 'Sell', badgeColor: '#D84C4C' },
};

const HISTORY_STATUS_META: Record<
  HistoryPreview['status'],
  { label: string; dotColor: string; textColor: string }
> = {
  complete: { label: 'Complete', dotColor: '#4ED7B0', textColor: '#4ED7B0' },
  closed: { label: 'Closed', dotColor: '#474747', textColor: '#A4A4A4' },
};

const TRADE_FILTERS: { key: TradeHistoryRange; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'day', label: 'Today' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

// --- Card Components for Mobile Content ---
function OrderCardPreview({ order }: { order: OrderPreview }) {
  const statusMeta = ORDER_STATUS_META[order.status];
  const sideMeta = ORDER_SIDE_META[order.side];
  const showProgress = order.status === 'partial' && typeof order.filledPercent === 'number';

  return (
    <article className="flex w-full flex-col gap-0 rounded-xl border border-[#474747] bg-[#16171D] p-4">
      <header className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex size-2 rounded-full"
            style={{ backgroundColor: statusMeta.dotColor }}
          />
          <span className="font-normal leading-none" style={{ color: statusMeta.textColor }}>
            {statusMeta.label}
          </span>
        </div>
        {order.cancellable && (
          <button
            type="button"
            className="ml-auto inline-flex size-8 items-center justify-center rounded-lg border border-[#474747] text-[#E9E9E9] transition hover:border-[#5F5F5F] hover:text-white"
            aria-label="Cancel order"
          >
            <Trash2 className="size-4" strokeWidth={1.5} />
          </button>
        )}
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-7 min-w-[3.5rem] items-center justify-center rounded-lg px-3 text-xs font-normal leading-none text-white"
            style={{ backgroundColor: sideMeta.badgeColor }}
          >
            {sideMeta.label}
          </span>
          <span className="text-sm font-medium leading-tight text-white">{order.pair}</span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap text-xs text-[#A4A4A4]">
          <span>{order.date}</span>
          <span>{order.time}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 text-xs text-[#A4A4A4]">
        <div className="flex items-center justify-between gap-2">
          <span>Price</span>
          <div className="flex items-baseline gap-2 text-white">
            <span className="font-normal leading-none">{order.price}</span>
            <span className="font-normal leading-none">{order.priceCurrency}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>{order.quantityLabel}</span>
          <div className="flex items-baseline gap-2 text-white">
            <span className="font-normal leading-none">{order.quantity}</span>
            <span className="font-normal leading-none">{order.quantityUnit}</span>
          </div>
        </div>
      </div>
      {showProgress && (
        <div className="flex flex-col gap-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#1F2029]">
            <div
              className="h-full rounded-full bg-[#215EEC]"
              style={{ width: `${Math.min(Math.max(order.filledPercent ?? 0, 0), 100)}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#B7B7B7]">
            <span>
              Filled : {order.filledAmount} {order.filledUnit}
            </span>
            <span className="font-normal leading-none">{order.filledPercent?.toFixed(2)} %</span>
          </div>
        </div>
      )}
    </article>
  );
}

function HistoryCardPreview({ entry }: { entry: HistoryPreview }) {
  const statusMeta = HISTORY_STATUS_META[entry.status];
  const sideMeta = ORDER_SIDE_META[entry.side];

  return (
    <article className="flex w-full flex-col gap-4 rounded-xl border border-[#474747] bg-[#16171D] p-4">
      <header className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex size-2 rounded-full"
            style={{ backgroundColor: statusMeta.dotColor }}
          />
          <span className="font-normal leading-none" style={{ color: statusMeta.textColor }}>
            {statusMeta.label}
          </span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap text-xs text-[#A4A4A4]">
          <span>{entry.date}</span>
          <span>{entry.time}</span>
        </div>
      </header>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-7 min-w-[3.5rem] items-center justify-center rounded-lg px-3 text-xs font-normal leading-none text-white"
            style={{ backgroundColor: sideMeta.badgeColor }}
          >
            {sideMeta.label}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight text-white">{entry.pair}</span>
            <span className="text-xs text-[#A4A4A4]">Order ID : {entry.orderId}</span>
          </div>
        </div>
      </div>
      <div className="grid gap-2 text-xs text-[#A4A4A4] sm:grid-cols-2">
        <div className="flex items-center justify-between gap-2 rounded-lg bg-[#1F2029] px-3 py-2">
          <span>{entry.status === 'complete' ? 'Matched' : 'Amount'}</span>
          <div className="flex items-baseline gap-2 text-white">
            <span className="font-normal leading-tight">{entry.amount}</span>
            <span className="font-normal leading-tight">{entry.baseSymbol}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg bg-[#1F2029] px-3 py-2">
          <span>Price</span>
          <div className="flex items-baseline gap-2 text-white">
            <span className="font-normal leading-tight">{entry.price}</span>
            <span className="font-normal leading-tight">{entry.priceCurrency}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// --- Data Wrapper for Mobile Content ---
function formatOrderId(orderId: string) {
  if (orderId.length <= 10) {
    return orderId;
  }
  return `${orderId.slice(0, 5)}...${orderId.slice(-5)}`;
}

function MobileHeader({ title }: { title: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold leading-tight">{title}</h2>
      </div>
    </header>
  );
}

function mapApiStatusToOrderStatus(
  apiStatus: 'OPEN' | 'CLOSED' | 'CANCELLED' | 'PARTIALLY_FILLED'
): OrderStatus {
  switch (apiStatus) {
    case 'OPEN':
      return 'pending';
    case 'PARTIALLY_FILLED':
      return 'partial';
    case 'CLOSED':
    case 'CANCELLED':
      return 'closed';
    default:
      return 'pending'; // Fallback for unknown statuses
  }
}

function OpenOrdersCards() {
  const { orders, loading, error, pagination, setPage } = useOpenOrders();

  return (
    <div className="flex flex-col h-full">
      {error ? (
        <div className="flex-1 flex items-center justify-center text-center text-red-500">
          Failed to load open orders.
        </div>
      ) : loading && orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-gray-400">
          Loading Open Orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-gray-400">
          No open orders
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {orders.map((order) => {
                const { date, time } = formatDateParts(order.createdAt, { includeSeconds: true });
                const mappedOrder: OrderPreview = {
                  id: order._id,
                  status: mapApiStatusToOrderStatus(order.status),
                  side: order.side.toLowerCase() as 'buy' | 'sell',
                  pair: `${order.symbol}/USDT`,
                  date,
                  time,
                  price: order.price.toString(),
                  priceCurrency: 'USDT',
                  quantityLabel: 'Amount',
                  quantity: order.originalAmount.toString(),
                  quantityUnit: order.symbol,
                  filledAmount: (order.originalAmount - order.amount).toString(),
                  filledUnit: order.symbol,
                  filledPercent:
                    order.originalAmount > 0
                      ? ((order.originalAmount - order.amount) / order.originalAmount) * 100
                      : 0,
                  cancellable: true,
                };
                return <OrderCardPreview key={order._id} order={mappedOrder} />;
              })}
            </div>
          </div>
          <PaginationFooter
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

function TradeHistoryCards() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filter, setFilter] = useState<TradeHistoryRange>('all');
  const { data, isLoading, error } = useGetTradeHistory({ page, limit, range: filter });
  const items = data?.items ?? [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-start gap-2 mb-4">
        {TRADE_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setFilter(key);
              setPage(1);
            }}
            className={`inline-flex h-7 items-center justify-center rounded-3xl px-3 text-xs font-medium transition ${
              filter === key
                ? 'border border-[#474747] bg-[#16171D] text-white'
                : 'text-[#A4A4A4] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center text-center text-red-500">
          Failed to load trade history.
        </div>
      ) : isLoading && items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-gray-400">
          Loading Trade History...
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-gray-400">
          No trade history
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((entry) => {
              const { date, time } = formatDateParts(entry.createdAt ?? entry.matchedAt ?? '', {
                includeSeconds: true,
              });
              const mappedEntry: HistoryPreview = {
                id: entry.id,
                status: entry.status?.toLowerCase() === 'matched' ? 'complete' : 'closed',
                side: entry.side.toLowerCase() as 'buy' | 'sell',
                pair: `${entry.baseSymbol ?? entry.symbol}/${entry.quoteSymbol ?? 'USDT'}`,
                date,
                time,
                orderId: formatOrderId(entry.tradeRef),
                amount: entry.amount.toString(),
                baseSymbol: entry.baseSymbol ?? entry.symbol,
                price: entry.price.toString(),
                priceCurrency: entry.currency,
              };
              return <HistoryCardPreview key={entry.id} entry={mappedEntry} />;
            })}
          </div>
        </div>
      )}
      <PaginationFooter
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        totalCount={data?.total ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}

// --- Main Component ---
export default function OpenOrderandTradeHistoryResponsive() {
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');
  const openRef = React.useRef<HTMLButtonElement>(null);
  const historyRef = React.useRef<HTMLButtonElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const isMobile = useIsMobile();

  React.useEffect(() => {
    const el = activeTab === 'open' ? openRef.current : historyRef.current;
    if (el) {
      setUnderlineStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeTab]);

  // Avoid rendering on server or during initial hydration check
  if (isMobile === undefined) {
    return null;
  }

  const renderContent = () => {
    if (activeTab === 'open') {
      return isMobile ? (
        <OpenOrdersProvider>
          <OpenOrdersCards />
        </OpenOrdersProvider>
      ) : (
        <OpenOrdersContainer showPagination={true} />
      );
    }
    if (activeTab === 'history') {
      return isMobile ? <TradeHistoryCards /> : <TradeHistoryContainer />;
    }
    return null;
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-3xl bg-[#16171D] p-4 text-white shadow-lg shadow-black/20 sm:p-6 lg:p-8 min-h-[480px] h-full">
      {/* Tabs */}
      <div className="relative flex border-b pb-3 gap-3 pl-4 border-[#ffffff]/5">
        <button
          ref={openRef}
          onClick={() => setActiveTab('open')}
          className={`px-3 h-8 text-sm flex items-center justify-center leading-[28px] ${
            activeTab === 'open' ? 'text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          Open Orders
        </button>
        <button
          ref={historyRef}
          onClick={() => setActiveTab('history')}
          className={`px-3 h-8 text-sm flex items-center justify-center leading-[28px] ${
            activeTab === 'history' ? 'text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          Trade History
        </button>
        <span
          className="absolute bottom-3 h-[2px] bg-[#225FED] transition-all duration-300 ease-in-out"
          style={underlineStyle}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden mt-4">{renderContent()}</div>
    </div>
  );
}
