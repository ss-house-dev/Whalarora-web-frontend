import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface TotalAssetsValueCardProps {
  totalValue: number;
  totalCost: number;
  pnlValue: number;
  pnlPercent: number;
  isLoading?: boolean;
  error?: string;
}

const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const truncateToDecimals = (value: number, decimals = 2) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const factor = 10 ** decimals;
  return Math.trunc(value * factor) / factor;
};

const formatCurrency = (value: number, { showPlus = false }: { showPlus?: boolean } = {}) => {
  if (!Number.isFinite(value)) {
    return '$0.00';
  }

  const truncated = truncateToDecimals(value);
  if (Math.abs(truncated) < Number.EPSILON) {
    return '$0.00';
  }

  const signPrefix = truncated < 0 ? '-' : showPlus ? '+' : '';
  const formatted = numberFormatter.format(Math.abs(truncated));
  return `${signPrefix}${formatted}`;
};

const formatPercent = (
  value: number,
  {
    showPlus = true,
    spaceBeforePercent = true,
  }: { showPlus?: boolean; spaceBeforePercent?: boolean } = {}
) => {
  if (!Number.isFinite(value)) {
    return `0.00${spaceBeforePercent ? ' %' : '%'}`;
  }

  const truncated = truncateToDecimals(value);
  const isZero = Math.abs(truncated) < Number.EPSILON;
  const signPrefix = truncated < 0 ? '-' : showPlus && !isZero ? '+' : '';
  const formatted = numberFormatter.format(Math.abs(truncated));
  const percentSymbol = spaceBeforePercent ? ' %' : '%';

  return `${signPrefix}${isZero ? '0.00' : formatted}${percentSymbol}`;
};

export default function TotalAssetsValueCard({
  totalValue,
  totalCost,
  pnlValue,
  pnlPercent,
  isLoading,
  error,
}: TotalAssetsValueCardProps) {
  if (isLoading) {
    return (
      <section className="mt-6 rounded-2xl border border-[#2A2B38] bg-[#1F2029] p-6 shadow-lg w-[624px]">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[#A4A4A4]">
          My assets value
        </h2>
        <div className="mt-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-6 rounded-2xl border border-[#2A2B38] bg-[#1F2029] p-6 shadow-lg w-[624px]">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[#A4A4A4]">
          My assets value
        </h2>
        <p className="mt-4 text-sm text-[#FF6B6B]">{error}</p>
      </section>
    );
  }

  const pnlClassName =
    pnlValue > 0 ? 'text-[#4ED7B0]' : pnlValue < 0 ? 'text-[#FF6B6B]' : 'text-[#A4A4A4]';

  const pnlText = `${formatCurrency(pnlValue, { showPlus: true })} (${formatPercent(pnlPercent, {
    showPlus: true,
    spaceBeforePercent: true,
  })})`;

  return (
    <section className="mt-6 rounded-2xl border border-[#2A2B38] bg-[#16171D] p-6 shadow-lg w-[603px]">
      <div className="flex items-center gap-12">
        <h2 className="text-lg font-medium tracking-wide text-white">My assets value</h2>
        <span className="rounded-full bg-[#1C2A55] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#4A7CFF]">
          Demo
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-[#2A2B38] bg-[#1F2029] px-3 py-5">
        <span className="text-sm font-medium tracking-wide text-[#7E7E7E]">
          Total Asset Value (USDT)
        </span>
        <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(totalValue)}</p>
      </div>

      <div className="mt-6 grid gap-6 text-sm text-[#A4A4A4] sm:grid-cols-2">
        <div>
          <span className="text-xs font-medium tracking-wide">Total Cost (USDT)</span>
          <p className="mt-2 text-base text-white">{formatCurrency(totalCost)}</p>
        </div>
        <div className="sm:text-right">
          <span className="text-xs font-medium tracking-wide">Unrealized PnL (USDT)</span>
          <p className={`mt-2 text-base font-semibold ${pnlClassName}`}>{pnlText}</p>
        </div>
      </div>
    </section>
  );
}
