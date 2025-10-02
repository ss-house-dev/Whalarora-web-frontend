'use client';

import Image from 'next/image';

import { useMemo } from 'react';

import { useMarketPrice } from '@/features/trading/hooks/useMarketPrice';

export type MyAssetsWidgetItem = {
  id: string | number;

  symbol: string;

  name: string;

  amount: number;

  unit: string;

  currentPrice: number;

  value: number;

  pnlValue: number;

  pnlPercent: number;

  iconSrc?: string;

  // Add cost basis properties for real-time calculation

  avgPrice?: number;

  total?: number;
};

interface MyAssetsWidgetProps {
  items: MyAssetsWidgetItem[];

  isLoading?: boolean;

  error?: string;

  className?: string;
}

const amountFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,

  maximumFractionDigits: 9,
});

const pnlValueFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,

  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',

  minimumFractionDigits: 2,

  maximumFractionDigits: 2,
});

const formatAmount = (amount: number, unit: string) => {
  if (!Number.isFinite(amount)) {
    return `0.00 ${unit}`;
  }

  return `${amountFormatter.format(amount)} ${unit}`;
};

const formatPnlValue = (value: number) => {
  if (!Number.isFinite(value) || value === 0) {
    return '+0.00';
  }

  const sign = value >= 0 ? '+' : '-';

  return `${sign}${pnlValueFormatter.format(Math.abs(value))}`;
};

const formatPercent = (value: number) => {
  if (!Number.isFinite(value) || value === 0) {
    return '+0.00%';
  }

  const sign = value >= 0 ? '+' : '-';

  return `${sign}${percentFormatter.format(Math.abs(value))}`;
};

const getTrendClassName = (change: number) => {
  if (!Number.isFinite(change) || change === 0) {
    return 'text-[#A4A4A4]';
  }

  return change > 0 ? 'text-[#4ED7B0]' : 'text-[#FF6B6B]';
};

const getComparablePnl = (value: number | undefined) =>
  Number.isFinite(value) ? (value as number) : Number.NEGATIVE_INFINITY;

const MyAssetsWidgetCard = ({ item }: { item: MyAssetsWidgetItem }) => {
  const { marketPrice, isPriceLoading } = useMarketPrice(item.symbol);

  const fallbackPrice =
    typeof item.currentPrice === 'number' && Number.isFinite(item.currentPrice)
      ? item.currentPrice
      : typeof item.avgPrice === 'number' && Number.isFinite(item.avgPrice)
        ? item.avgPrice
        : 0;

  const displayPrice = marketPrice ? parseFloat(marketPrice.replace(/,/g, '')) : fallbackPrice;

  const realTimeValue = displayPrice * item.amount;

  const costBasis =
    typeof item.total === 'number' && Number.isFinite(item.total)
      ? item.total
      : typeof item.avgPrice === 'number' && Number.isFinite(item.avgPrice)
        ? item.avgPrice * item.amount
        : 0;

  const realTimePnlValue = realTimeValue - costBasis;

  const realTimePnlPct = costBasis > 0 ? realTimePnlValue / costBasis : 0;

  const trendClass = getTrendClassName(realTimePnlPct);

  if (isPriceLoading) {
    return (
      <div className="flex w-full items-center justify-between gap-6 rounded-xl bg-[#1F2029] p-4">
        <div className="flex flex-1 items-center gap-3">
          {item.iconSrc ? (
            <Image
              src={item.iconSrc}
              alt={`${item.name} icon`}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7931A] text-sm font-semibold uppercase text-white">
              {item.symbol.slice(0, 3)}
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium leading-tight text-white">
              {item.name}
            </span>

            <span className="truncate text-sm font-normal leading-tight text-[#A4A4A4]">
              {formatAmount(item.amount, item.unit)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <div className="h-5 w-20 animate-pulse rounded-md bg-gray-700" />

          <div className="h-4 w-16 animate-pulse rounded-md bg-gray-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-between gap-6 rounded-xl bg-[#1F2029] p-4">
      <div className="flex flex-1 items-center gap-3">
        {item.iconSrc ? (
          <Image
            src={item.iconSrc}
            alt={`${item.name} icon`}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7931A] text-sm font-semibold uppercase text-white">
            {item.symbol.slice(0, 3)}
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium leading-tight text-white">{item.name}</span>

          <span className="truncate text-sm font-normal leading-tight text-[#A4A4A4]">
            {formatAmount(item.amount, item.unit)}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end text-right">
        <span className={`text-sm font-medium leading-tight ${trendClass}`}>
          {formatPnlValue(realTimePnlValue)}
        </span>

        <span className={`text-xs font-normal leading-tight ${trendClass}`}>
          ({formatPercent(realTimePnlPct)})
        </span>
      </div>
    </div>
  );
};

const MyAssetsWidgetState = ({ message }: { message: string }) => (
  <div className="flex min-h-[96px] items-center justify-center rounded-xl bg-[#1F2029] p-6 text-center">
    <span className="text-sm font-normal text-[#A4A4A4]">{message}</span>
  </div>
);

export function MyAssetsWidget({
  items,

  isLoading = false,

  error,

  className = '',
}: MyAssetsWidgetProps) {
  const hasItems = items.length > 0;

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const bPnl = getComparablePnl(b.pnlValue);

      const aPnl = getComparablePnl(a.pnlValue);

      if (bPnl !== aPnl) {
        return bPnl - aPnl;
      }

      return b.name.localeCompare(a.name);
    });
  }, [items]);

  return (
    <div
      className={`flex h-[548px] w-full max-w-96 flex-col gap-3 rounded-xl bg-[#16171D] p-5 text-palatte-color-base-white ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-normal leading-7 text-palatte-color-base-white">My assets</h3>
      </div>

      <div className="flex items-center justify-between border-b border-[#1F2029] px-0 pb-2 pt-2">
        <span className="text-xs font-normal leading-none text-palatte-color-netural-gray-GR200 font-['Alexandria']">
          Symbol
        </span>

        <span className="text-xs font-normal leading-none text-palatte-color-netural-gray-GR200 font-['Alexandria'] pr-2">
          Unrealized pnl (USDT)
        </span>
      </div>

      <div className="flex flex-1 gap-2 overflow-y-auto pr-3">
        <div className="flex h-full flex-1 flex-col">
          <div className="flex-1">
            <div className="-mr-3">
              <div className="space-y-3 pb-3 pt-3 pr-2">
                {isLoading && <MyAssetsWidgetState message="Loading assets..." />}

                {!isLoading && error && <MyAssetsWidgetState message={error} />}

                {!isLoading && !error && !hasItems && <MyAssetsWidgetState message="No assets" />}

                {!isLoading &&
                  !error &&
                  hasItems &&
                  sortedItems.map((item) => <MyAssetsWidgetCard key={item.id} item={item} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyAssetsWidget;
