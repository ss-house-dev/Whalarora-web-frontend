'use client';

import Image from 'next/image';

import { useMemo } from 'react';

import styles from './MyAssetsWidget.module.css';

import { useAllMarketPrices } from '../hooks/useAllMarketPrices';
import {
  type SymbolPrecision,
  formatPriceWithTick,
  formatAmountWithStep,
} from '@/features/trading/utils/symbolPrecision';

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
  precision?: SymbolPrecision;
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

const formatAmount = (amount: number, unit: string, precision?: SymbolPrecision) => {
  return `${formatAmountWithStep(amount, precision)} ${unit}`;
};

const formatPnlValue = (value: number, precision?: SymbolPrecision) => {
  return formatPriceWithTick(Math.abs(value), precision);
};

const formatPercent = (value: number) => {
  if (!Number.isFinite(value) || value === 0) {
    return '0.00%';
  }
  return `${percentFormatter.format(Math.abs(value))}`;
};

const getTrendClassName = (change: number) => {
  if (!Number.isFinite(change) || change === 0) {
    return 'text-[#A4A4A4]';
  }

  return change > 0 ? 'text-[#4ED7B0]' : 'text-[#FF6B6B]';
};

const getComparablePnl = (value: number | undefined) =>
  Number.isFinite(value) ? (value as number) : Number.NEGATIVE_INFINITY;

const MyAssetsWidgetSkeleton = () => (
  <div className="flex w-full items-center justify-between gap-6 rounded-xl bg-[#1F2029] p-4">
    <div className="flex flex-1 items-center gap-3">
      <div className={`${styles.skeletonRow} h-10 w-10 rounded-full`} />
      <div className="flex flex-1 flex-col gap-2">
        <div className={`${styles.skeletonRow} h-3 w-24 rounded`} />
        <div className={`${styles.skeletonRow} h-3 w-32 rounded`} />
      </div>
    </div>
    <div className="flex flex-col items-end gap-2">
      <div className={`${styles.skeletonRow} h-3 w-20 rounded`} />
      <div className={`${styles.skeletonRow} h-3 w-16 rounded`} />
    </div>
  </div>
);

const ArrowUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4.66602 10L7.99935 6.66667L11.3327 10"
      stroke="#4ED7B0"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.334 6L8.00065 9.33333L4.66732 6"
      stroke="#FF6B6B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MyAssetsWidgetCard = ({
  item,
  realTimePnlValue,
  realTimePnlPct,
}: {
  item: MyAssetsWidgetItem;
  realTimePnlValue: number;
  realTimePnlPct: number;
}) => {
  const trendClass = getTrendClassName(realTimePnlPct);

  return (
    <div className="flex w-full items-center justify-between gap-6 rounded-xl bg-[#1F2029] p-4 transition-colors duration-200 hover:bg-[#2A2B35] active:bg-[#3B3C47] cursor-pointer">
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
          <div className="flex items-center gap-1">
            <span className="truncate text-sm font-medium leading-tight text-white">
              {item.name}
            </span>
            {realTimePnlValue > 0 && <ArrowUpIcon />}
            {realTimePnlValue < 0 && <ArrowDownIcon />}
          </div>
          <span className="truncate text-sm font-normal leading-tight text-[#A4A4A4]">
            {formatAmount(item.amount, item.unit, item.precision)}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end text-right">
        <span className={`text-sm font-medium leading-tight ${trendClass}`}>
          {formatPnlValue(realTimePnlValue, item.precision)}
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

  const symbols = useMemo(() => items.map((item) => item.symbol), [items]);
  const { prices: marketPrices, isLoading: arePricesLoading } = useAllMarketPrices(symbols);

  const sortedItems = useMemo(() => {
    const itemsWithPnl = items.map((item) => {
      const marketPriceString = marketPrices[item.symbol.toUpperCase()];
      const marketPrice = marketPriceString ? parseFloat(marketPriceString) : item.currentPrice;

      const displayPrice = Number.isFinite(marketPrice) ? marketPrice : item.currentPrice;
      const realTimeValue = displayPrice * item.amount;
      const costBasis =
        typeof item.total === 'number' && Number.isFinite(item.total)
          ? item.total
          : (item.avgPrice ?? 0) * item.amount;
      const realTimePnlValue = realTimeValue - costBasis;
      const realTimePnlPct = costBasis > 0 ? realTimePnlValue / costBasis : 0;

      return {
        ...item,
        realTimePnlValue,
        realTimePnlPct,
      };
    });

    return itemsWithPnl.sort((a, b) => {
      const bPnl = getComparablePnl(b.realTimePnlValue);
      const aPnl = getComparablePnl(a.realTimePnlValue);

      if (bPnl !== aPnl) {
        return bPnl - aPnl;
      }
      return b.name.localeCompare(a.name);
    });
  }, [items, marketPrices]);

  return (
    <div
      className={`flex h-[548px] w-full max-w-96 flex-col gap-3 rounded-xl bg-[#16171D] p-5 text-palatte-color-base-white ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-normal leading-7 text-palatte-color-base-white">My assets</h3>
      </div>

      <div className="flex items-center justify-between border-b border-[#1F2029] px-0 pb-2 pt-2">
        <span className="text-xs font-normal leading-none text-[#A4A4A4] font-['Alexandria']">
          Symbol
        </span>

        <span className="text-xs font-normal leading-none text-[#A4A4A4] font-['Alexandria'] pr-2">
          Unrealized pnl (USDT)
        </span>
      </div>

      <div className="flex flex-1 gap-2 overflow-y-auto pr-1">
        <div className="flex h-full flex-1 flex-col">
          <div className="flex-1">
            <div>
              <div className="space-y-3 pb-3 pt-3">
                {isLoading &&
                  Array.from({ length: 4 }).map((_, index) => (
                    <MyAssetsWidgetSkeleton key={`my-assets-skeleton-${index}`} />
                  ))}

                {!isLoading && error && <MyAssetsWidgetState message={error} />}

                {!isLoading && !error && !hasItems && <MyAssetsWidgetState message="No assets" />}

                {!isLoading &&
                  !error &&
                  hasItems &&
                  sortedItems.map((item) => (
                    <MyAssetsWidgetCard
                      key={item.id}
                      item={item}
                      realTimePnlValue={item.realTimePnlValue}
                      realTimePnlPct={item.realTimePnlPct}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyAssetsWidget;
