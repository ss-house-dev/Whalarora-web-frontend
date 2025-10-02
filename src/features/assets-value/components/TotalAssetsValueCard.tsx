import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface TotalAssetsValueCardProps {
  totalValue: number;
  isLoading?: boolean;
  error?: string;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) {
    return '$0.00';
  }

  const truncated = Math.trunc(Number(value) * 100) / 100;
  const formatted = currencyFormatter.format(Math.max(truncated, 0));
  return `$${formatted}`;
};

export default function TotalAssetsValueCard({
  totalValue,
  isLoading,
  error,
}: TotalAssetsValueCardProps) {
  return (
    <section className="mt-6 rounded-2xl border border-[#2A2B38] bg-[#1F2029] p-6 shadow-lg">
      <h2 className="text-sm font-medium uppercase tracking-wide text-[#A4A4A4]">
        Total Assets Value
      </h2>

      {isLoading ? (
        <div className="mt-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
      ) : error ? (
        <p className="mt-4 text-sm text-[#FF6B6B]">
          {error}
        </p>
      ) : (
        <p className="mt-4 text-3xl font-semibold text-white">
          {formatCurrency(totalValue)}
        </p>
      )}

      <p className="mt-2 text-xs text-[#7E7E7E]">
        Sum of your holdings multiplied by their current prices.
      </p>
    </section>
  );
}
