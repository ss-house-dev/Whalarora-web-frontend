import React from 'react';
import clsx from 'clsx';
import { anuphan } from '@/fonts/anuphan';

interface TotalAssetsValueCardProps {
  totalValue: number;
  totalCost: number;
  pnlValue: number;
  pnlPercent: number;
  isLoading?: boolean;
  error?: string;
  className?: string;
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
  return Math.round((value + Number.EPSILON * Math.sign(value)) * factor) / factor;
};

const formatCurrency = (value: number, { showPlus = false }: { showPlus?: boolean } = {}) => {
  if (!Number.isFinite(value)) {
    return '0.00';
  }

  const truncated = truncateToDecimals(value);
  if (Math.abs(truncated) < Number.EPSILON) {
    return '0.00';
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
  isLoading = false,
  className = '',
}: TotalAssetsValueCardProps) {
  const pnlClassName =
    pnlValue > 0 ? 'text-[#4ED7B0]' : pnlValue < 0 ? 'text-[#FF6B6B]' : 'text-[#A4A4A4]';

  const pnlText = `${formatCurrency(pnlValue, { showPlus: true })} (${formatPercent(pnlPercent, {
    showPlus: true,
    spaceBeforePercent: true,
  })})`;

  return (
    <section
      className={clsx(
        'w-full max-w-[603px] h-[196px] rounded-xl bg-[#16171D] px-4 py-3',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-row items-start gap-3 sm:flex-row sm:items-center sm:gap-12">
        <h2 className="text-base tracking-wide text-white sm:text-lg">My assets value</h2>
        <span
          className={`${anuphan.className} rounded-full bg-[rgba(31,66,147,0.20)] w-[79px] text-center py-1 text-sm font-medium text-[#225FED]`}
        >
          Demo
        </span>
      </div>

      {/* Total Asset Value */}
      <div className="mt-3 rounded-xl bg-[#1F2029] px-3 py-2">
        <span className="text-xs font-medium tracking-wide text-[#7E7E7E] sm:text-sm">
          Total Asset Value (USDT)
        </span>
        <p className="mt-3 text-lg font-normal text-white sm:text-xl">
          {isLoading ? '0.00' : formatCurrency(totalValue)}
        </p>
      </div>

      {/* Total Cost and PnL */}
      <div className="mt-3 flex flex-col gap-2 text-sm text-[#A4A4A4] min-[328px]:flex-row min-[328px]:gap-4 sm:gap-8 md:gap-20 lg:gap-39">
        {/* Total Cost */}
        <div className="flex-shrink-0">
          <span className="ml-3 text-xs font-normal">Total Cost (USDT)</span>
          <p className="ml-3 mt-1 text-xs text-white">
            {isLoading ? '0.00' : formatCurrency(totalCost)}
          </p>
        </div>

        {/* Unrealized PnL */}
        <div className="flex-1 ml-3 min-[328px]:ml-0">
          <span className="text-xs font-normal">Unrealized PnL (USDT)</span>
          <p className={`mt-1 text-xs ${isLoading ? 'text-white' : pnlClassName}`}>
            {isLoading ? '0.00 (0.00 %)' : pnlText}
          </p>
        </div>
      </div>
    </section>
  );
}
