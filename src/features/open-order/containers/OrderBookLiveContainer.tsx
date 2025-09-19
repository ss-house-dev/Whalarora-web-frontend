'use client';

import React from 'react';
import clsx from 'clsx';
import OrderBookWidget, { OrderBookWidgetProps } from '@/features/open-order/components/OrderBookWidget';
import { useCoinContext } from '@/features/trading/contexts/CoinContext';
import {
  OrderBookSide,
  OrderBookStreamStatus,
  useOrderBookStream,
} from '@/features/open-order/hooks/useOrderBookStream';

const STATUS_LABEL: Record<OrderBookStreamStatus, string> = {
  idle: 'Idle',
  connecting: 'Connecting...',
  connected: 'Live',
  disconnected: 'Disconnected',
};

function formatPrice(value?: OrderBookSide['price'], quoteSymbol?: string | null) {
  if (value === undefined || value === null) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  const formatted = numeric.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (!quoteSymbol) return formatted;
  if (quoteSymbol === 'USD' || quoteSymbol === 'USDT') {
    return `$ ${formatted}`;
  }
  return `${quoteSymbol} ${formatted}`;
}

type SideContent = OrderBookWidgetProps['bid'];

function toSideContent(
  side: 'bid' | 'ask',
  payload: OrderBookSide | null | undefined,
  baseSymbol: string,
  quoteSymbol: string
): SideContent {
  if (!payload) {
    return {
      label: side === 'bid' ? 'Bid' : 'Ask',
      amountLabel: `Amount (${baseSymbol})`,
      amountSymbol: baseSymbol,
    };
  }

  return {
    label: side === 'bid' ? 'Bid' : 'Ask',
    amountLabel: `Amount (${baseSymbol})`,
    amountSymbol: baseSymbol,
    price: formatPrice(payload.price, quoteSymbol),
    amount: payload.qty === undefined || payload.qty === null ? null : String(payload.qty),
  };
}

function parseSymbols(label?: string) {
  if (!label) return { base: 'BTC', quote: 'USDT' };
  const [base, quote] = label.toUpperCase().split('/');
  return {
    base: base?.trim() || 'BTC',
    quote: quote?.trim() || 'USDT',
  };
}

function ExtractedSymbol({ status, symbol }: { status: OrderBookStreamStatus; symbol: string }) {
  return (
    <span
      className={clsx(
        'rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide',
        status === 'connected' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-500/10 text-slate-300'
      )}
    >
      {symbol}
    </span>
  );
}

interface OrderBookLiveContainerProps {
  className?: string;
  showMetaInfo?: boolean;
}

export default function OrderBookLiveContainer({
  className,
  showMetaInfo = true,
}: OrderBookLiveContainerProps) {
  const { selectedCoin } = useCoinContext();
  const { base, quote } = React.useMemo(
    () => parseSymbols(selectedCoin?.label),
    [selectedCoin?.label]
  );

  const { data, status, error, activeSymbol } = useOrderBookStream(base);

  const bid = React.useMemo(
    () => toSideContent('bid', data?.bid, base, quote),
    [base, quote, data?.bid]
  );
  const ask = React.useMemo(
    () => toSideContent('ask', data?.ask, base, quote),
    [base, quote, data?.ask]
  );

  const updatedAt = React.useMemo(() => {
    if (!data?.ts) return null;
    const tsNumber = typeof data.ts === 'string' ? Number(data.ts) : data.ts;
    if (!Number.isFinite(tsNumber)) return null;
    return new Date(tsNumber).toLocaleTimeString('th-TH', { hour12: false });
  }, [data?.ts]);

  const containerClass = clsx('flex flex-col gap-3', showMetaInfo ? 'items-center' : undefined, className);

  return (
    <div className={containerClass}>
      <OrderBookWidget bid={bid} ask={ask} disabled={status !== 'connected'} />
      {showMetaInfo ? (
        <div className="flex flex-col items-center gap-1 text-xs text-[#A4A4A4]">
          <div className="flex items-center gap-2">
            <span>Status: {STATUS_LABEL[status]}</span>
            <ExtractedSymbol status={status} symbol={activeSymbol ?? base} />
          </div>
          {updatedAt && <div>Last update: {updatedAt}</div>}
          {error && <div className="text-red-400">{error}</div>}
        </div>
      ) : null}
    </div>
  );
}
