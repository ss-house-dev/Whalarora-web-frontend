import React from 'react';
import { Trash2 } from 'lucide-react';

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

const ORDER_STATUS_META: Record<OrderStatus, { label: string; dotColor: string; textColor: string }> = {
  complete: { label: 'Complete', dotColor: '#4ED7B0', textColor: '#4ED7B0' },
  partial: { label: 'Partially Filled', dotColor: '#FFD477', textColor: '#FFD477' },
  pending: { label: 'Pending', dotColor: '#215EEC', textColor: '#6F8BFF' },
  closed: { label: 'Closed', dotColor: '#474747', textColor: '#A4A4A4' },
};

const ORDER_SIDE_META: Record<OrderSide, { label: string; badgeColor: string }> = {
  buy: { label: 'Buy', badgeColor: '#217871' },
  sell: { label: 'Sell', badgeColor: '#D84C4C' },
};

const HISTORY_STATUS_META: Record<HistoryPreview['status'], { label: string; dotColor: string; textColor: string }> = {
  complete: { label: 'Complete', dotColor: '#4ED7B0', textColor: '#4ED7B0' },
  closed: { label: 'Closed', dotColor: '#474747', textColor: '#A4A4A4' },
};

function OrderCardPreview({ order }: { order: OrderPreview }) {
  const statusMeta = ORDER_STATUS_META[order.status];
  const sideMeta = ORDER_SIDE_META[order.side];
  const showProgress = order.status === 'partial' && typeof order.filledPercent === 'number';

  return (
    <article className="flex w-full max-w-xs flex-col gap-4 rounded-xl border border-[#474747] bg-[#16171D] p-4 sm:max-w-none">
      <header className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-2 rounded-full" style={{ backgroundColor: statusMeta.dotColor }} />
          <span className="font-normal leading-none" style={{ color: statusMeta.textColor }}>
            {statusMeta.label}
          </span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap text-[#A4A4A4]">
          <span>{order.date}</span>
          <span>{order.time}</span>
        </div>
        {order.cancellable ? (
          <button
            type="button"
            className="ml-auto inline-flex size-8 items-center justify-center rounded-lg border border-[#474747] text-[#E9E9E9] transition hover:border-[#5F5F5F] hover:text-white"
            aria-label="Cancel order"
          >
            <Trash2 className="size-4" strokeWidth={1.5} />
          </button>
        ) : null}
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

      {showProgress ? (
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
            <span className="font-normal leading-none">
              {order.filledPercent?.toFixed(2)} %
            </span>
          </div>
        </div>
      ) : null}
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
          <span className="inline-flex size-2 rounded-full" style={{ backgroundColor: statusMeta.dotColor }} />
          <span className="font-normal leading-none" style={{ color: statusMeta.textColor }}>
            {statusMeta.label}
          </span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap text-[#A4A4A4]">
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

const TRADE_FILTERS = ['All', 'Today', 'Month', 'Year'] as const;

const OPEN_ORDER_MOCKS: OrderPreview[] = [
  {
    id: 'oo-1',
    status: 'complete',
    side: 'buy',
    pair: 'BTC/USDT',
    date: '13-Aug-2025',
    time: '14:30:30',
    price: '115,000.00',
    priceCurrency: 'USDT',
    quantityLabel: 'Matched',
    quantity: '0.020000000',
    quantityUnit: 'BTC',
  },
  {
    id: 'oo-2',
    status: 'partial',
    side: 'sell',
    pair: 'BTC/USDT',
    date: '13-Aug-2025',
    time: '14:30:30',
    price: '115,000.00',
    priceCurrency: 'USDT',
    quantityLabel: 'Amount',
    quantity: '0.020000000',
    quantityUnit: 'BTC',
    filledAmount: '0.010000000',
    filledUnit: 'BTC',
    filledPercent: 50,
    cancellable: true,
  },
  {
    id: 'oo-3',
    status: 'pending',
    side: 'buy',
    pair: 'ETH/USDT',
    date: '14-Aug-2025',
    time: '09:12:04',
    price: '3,185.40',
    priceCurrency: 'USDT',
    quantityLabel: 'Amount',
    quantity: '1.500000',
    quantityUnit: 'ETH',
    cancellable: true,
  },
  {
    id: 'oo-4',
    status: 'closed',
    side: 'sell',
    pair: 'SOL/USDT',
    date: '12-Aug-2025',
    time: '18:42:12',
    price: '156.00',
    priceCurrency: 'USDT',
    quantityLabel: 'Amount',
    quantity: '12.500000',
    quantityUnit: 'SOL',
  },
];

const TRADE_HISTORY_MOCKS: HistoryPreview[] = [
  {
    id: 'th-1',
    status: 'complete',
    side: 'buy',
    pair: 'BTC/USDT',
    date: '13-Aug-2025',
    time: '14:30:30',
    orderId: 'XYSK-918273',
    amount: '0.010000000',
    baseSymbol: 'BTC',
    price: '115,000.00',
    priceCurrency: 'USDT',
  },
  {
    id: 'th-2',
    status: 'closed',
    side: 'sell',
    pair: 'ETH/USDT',
    date: '12-Aug-2025',
    time: '19:12:15',
    orderId: 'PLMZ-456832',
    amount: '2.500000000',
    baseSymbol: 'ETH',
    price: '3,200.00',
    priceCurrency: 'USDT',
  },
  {
    id: 'th-3',
    status: 'complete',
    side: 'sell',
    pair: 'SOL/USDT',
    date: '11-Aug-2025',
    time: '22:05:45',
    orderId: 'FILL-009988',
    amount: '6.700000000',
    baseSymbol: 'SOL',
    price: '147.80',
    priceCurrency: 'USDT',
  },
];

export default function OpenOrderandTradeHistoryResponsive() {
  return (
    <div className="flex w-full flex-col gap-8 rounded-3xl bg-[#0F1015] p-4 text-white shadow-lg shadow-black/20 sm:p-6 lg:p-8">
      <section className="flex flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold leading-tight">Open Orders</h2>
            <p className="text-sm text-[#A4A4A4]">Responsive card layout preview</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#A4A4A4]">
            <span className="hidden sm:inline">Last update</span>
            <span className="rounded-lg bg-[#16171D] px-3 py-1 font-medium text-white">14:32:10</span>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {OPEN_ORDER_MOCKS.map((order) => (
            <OrderCardPreview key={order.id} order={order} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold leading-tight">Trade History</h2>
            <p className="text-sm text-[#A4A4A4]">Preview of recent fills and closes</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {TRADE_FILTERS.map((label, index) => {
              const isActive = index === 0;
              return (
                <span
                  key={label}
                  className={`inline-flex h-7 items-center justify-center rounded-3xl px-3 text-xs font-medium transition ${
                    isActive
                      ? 'border border-[#474747] bg-[#16171D] text-white'
                      : 'text-[#A4A4A4] hover:text-white'
                  }`}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          {TRADE_HISTORY_MOCKS.map((entry) => (
            <HistoryCardPreview key={entry.id} entry={entry} />
          ))}
        </div>
      </section>
    </div>
  );
}
