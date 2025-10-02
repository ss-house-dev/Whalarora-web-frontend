'use client';

import Image from 'next/image';
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

const valueFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
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

const formatValue = (value: number) => {
  if (!Number.isFinite(value)) {
    return '$0.00';
  }

  return valueFormatter.format(value);
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

const MyAssetsWidgetCard = ({ item }: { item: MyAssetsWidgetItem }) => {
  const { marketPrice, isPriceLoading } = useMarketPrice(item.symbol);

  const displayPrice = marketPrice ? parseFloat(marketPrice.replace(/,/g, '')) : 0;

  const realTimeValue = displayPrice * item.amount;

  const realTimePnlPct =
    item.avgPrice && item.avgPrice > 0 ? (displayPrice - item.avgPrice) / item.avgPrice : 0;

  const trendClass = getTrendClassName(realTimePnlPct);

  if (isPriceLoading) {
    // You can return a skeleton loader here if you want
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
          <div className="h-5 w-16 animate-pulse rounded-md bg-gray-700" />
          <div className="h-5 w-20 animate-pulse rounded-md bg-gray-700" />
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
      <div className="flex flex-col items-end gap-1 text-right">
        <span className={`text-sm font-medium leading-tight ${trendClass}`}>
          {formatPercent(realTimePnlPct)}
        </span>
        <span className="text-sm font-medium leading-tight text-white">
          {formatValue(realTimeValue)}
        </span>
      </div>
    </div>
  );
};

const MyAssetsWidgetState = ({ message }: { message: string }) => (
  <div className="flex h-full items-center justify-center">
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

  return (
    <div
      className={`flex h-[548px] w-full max-w-96 flex-col gap-6 rounded-xl bg-[#16171D] p-5 text-palatte-color-base-white ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-normal leading-7 text-palatte-color-base-white">My assets</h3>
      </div>

      <div className="flex flex-1 gap-2 overflow-hidden">
        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {isLoading && <MyAssetsWidgetState message="Loading assets..." />}

            {!isLoading && error && <MyAssetsWidgetState message={error} />}

            {!isLoading && !error && !hasItems && <MyAssetsWidgetState message="No assets" />}

            {!isLoading &&
              !error &&
              hasItems &&
              items.map((item) => <MyAssetsWidgetCard key={item.id} item={item} />)}
          </div>
        </div>
        <div className="h-full w-2 rounded-xl bg-[#1F2029]" />
      </div>
    </div>
  );
}

export default MyAssetsWidget;
