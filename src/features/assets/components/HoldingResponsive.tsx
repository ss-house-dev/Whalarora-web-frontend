'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

const palette = {
  card: '#1F2029',
  surfaceAlt: '#16171D',
  success: '#4ED7B0',
  danger: '#FF6B6B',
  gray400: '#A4A4A4',
  gray500: '#7E7E7E',
  stroke: '#3A3B44',
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const amountFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 9,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const clampPage = (value: number, total: number) => {
  if (!Number.isFinite(value) || total <= 0) {
    return 1;
  }
  const maxPage = Math.max(1, total);
  const safe = Math.trunc(value);
  return Math.min(Math.max(safe, 1), maxPage);
};

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0.00';
  }
  return currencyFormatter.format(value);
};

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0.00';
  }
  return amountFormatter.format(value);
};

const formatPercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return '+0.00%';
  }
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${percentFormatter.format(Math.abs(value))}`;
};

type HoldingItem = {
  id: string | number;
  symbol: string;
  name: string;
  amount: number;
  unit?: string;
  averageCost: number;
  value: number;
  pnlAbs: number;
  pnlPct: number;
  iconSrc?: string;
};

type HoldingResponsiveProps = {
  holdings: HoldingItem[];
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string;
  pageSize?: number;
  initialPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onBuySell?: (holding: HoldingItem) => void;
  buySellLabel?: string;
  className?: string;
};

type PaginationProps = {
  page: number;
  totalPages: number;
  onSelect: (page: number) => void;
};

type StatProps = {
  label: string;
  value: string;
  className?: string;
};

const TokenAvatar = ({
  symbol,
  name,
  iconSrc,
}: {
  symbol: string;
  name: string;
  iconSrc?: string;
}) => {
  if (iconSrc) {
    return (
      <Image
        src={iconSrc}
        alt={`${name} logo`}
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7931A] text-sm font-semibold text-white uppercase">
      {symbol.toUpperCase().slice(0, 3)}
    </div>
  );
};

const Stat = ({ label, value, className = '' }: StatProps) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <span className="text-xs text-[#A4A4A4]">{label}</span>
    <span className="text-sm text-white">{value}</span>
  </div>
);

const Pagination = ({ page, totalPages, onSelect }: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const windowSlots =
    totalPages <= 3
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : [page - 1, page, page + 1].map((candidate, index) => {
          if (page === 1) {
            return index + 1;
          }
          if (page === totalPages) {
            return totalPages - (2 - index);
          }
          return candidate;
        });

  const uniqueSlots = Array.from(
    new Set(windowSlots.filter((slot) => slot >= 1 && slot <= totalPages))
  );

  const handleChange = (next: number) => {
    onSelect(clampPage(next, totalPages));
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => handleChange(page - 1)}
        disabled={page === 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1F2029] text-xs text-[#7E7E7E] transition hover:text-white disabled:cursor-not-allowed disabled:text-[#474747]"
      >
        <ChevronLeft size={14} />
      </button>
      {uniqueSlots.map((slot) => {
        const isActive = slot === page;
        return (
          <button
            key={slot}
            type="button"
            onClick={() => handleChange(slot)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition ${
              isActive
                ? 'border-[#215EEC] text-white'
                : 'border-transparent text-[#A4A4A4] hover:text-white'
            }`}
            style={{ backgroundColor: palette.card }}
          >
            {slot}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => handleChange(page + 1)}
        disabled={page === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1F2029] text-xs text-[#7E7E7E] transition hover:text-white disabled:cursor-not-allowed disabled:text-[#474747]"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

export function HoldingResponsive({
  holdings,
  isLoading = false,
  loadingMessage = 'Loading...',
  error,
  pageSize = 3,
  initialPage = 1,
  currentPage,
  onPageChange,
  onBuySell,
  buySellLabel = 'Buy/Sell',
  className = '',
}: HoldingResponsiveProps) {
  const totalAssets = holdings.length;
  const resolvedPageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalAssets / resolvedPageSize));
  const isControlled = typeof currentPage === 'number';

  const [internalPage, setInternalPage] = useState(() => clampPage(initialPage, totalPages));

  useEffect(() => {
    if (!isControlled) {
      setInternalPage(clampPage(initialPage, totalPages));
    }
  }, [initialPage, totalPages, isControlled]);

  useEffect(() => {
    if (!isControlled) {
      setInternalPage((prev) => clampPage(prev, totalPages));
    }
  }, [totalPages, isControlled]);

  const activePage = isControlled ? clampPage(currentPage ?? 1, totalPages) : internalPage;

  const changePage = (nextPage: number) => {
    const next = clampPage(nextPage, totalPages);
    if (!isControlled) {
      setInternalPage(next);
    }
    onPageChange?.(next);
  };

  const pagedHoldings = useMemo(() => {
    const start = (activePage - 1) * resolvedPageSize;
    return holdings.slice(start, start + resolvedPageSize);
  }, [holdings, activePage, resolvedPageSize]);

  const showPagination = totalPages > 1;

  const content = (() => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {loadingMessage && <p className="text-sm text-[#A4A4A4]">{loadingMessage}</p>}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: Math.min(resolvedPageSize, 3) }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="flex h-[252px] w-full flex-col gap-3 rounded-xl border border-[#3A3B44] bg-[#1F2029] p-4"
              >
                <div className="h-10 w-full animate-pulse rounded-lg bg-[#262733]" />
                <div className="hidden flex-1 animate-pulse rounded-lg bg-[#262733] sm:block" />
                <div className="h-8 animate-pulse rounded-lg bg-[#262733]" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-48 items-center justify-center rounded-xl border border-[#3A3B44] bg-[#1F2029] p-6">
          <p className="text-sm text-[#FF6B6B]">{error}</p>
        </div>
      );
    }

    if (pagedHoldings.length === 0) {
      return (
        <div className="flex h-48 items-center justify-center rounded-xl border border-[#3A3B44] bg-[#1F2029] p-6">
          <p className="text-sm text-[#A4A4A4]">No holding asset.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pagedHoldings.map((holding) => {
          const isGain = holding.pnlAbs >= 0;
          const pnlAmountText = `${isGain ? '' : '-'}${formatCurrency(Math.abs(holding.pnlAbs))}`;
          return (
            <article
              key={holding.id}
              className="flex h-full w-full flex-col gap-3 rounded-xl bg-[#1F2029] p-3 shadow-sm"
              style={{
                outlineColor: palette.stroke,
                outlineOffset: -1,
              }}
            >
              <div className="flex items-center gap-2 sm:gap-2.5">
                <TokenAvatar
                  symbol={holding.symbol}
                  name={holding.name}
                  iconSrc={holding.iconSrc}
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-baseline gap-1 text-sm sm:flex-wrap">
                    <span className="text-white">{holding.symbol}</span>
                    <span className="text-[#A4A4A4]">{holding.name}</span>
                  </div>
                  <div className="flex w-full items-center justify-between rounded-lg bg-[#1F2029] px-2 py-1 text-sm">
                    <span className="text-white">{formatAmount(holding.amount)}</span>
                    <span className="text-right text-[#A4A4A4]">
                      {(holding.unit ?? holding.symbol).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(148px,1fr))] gap-3 sm:gap-4">
                  <Stat
                    label="Average cost (USDT)"
                    value={formatCurrency(holding.averageCost)}
                    className="sm:w-36"
                  />
                  <Stat label="Value" value={formatCurrency(holding.value)} className="sm:w-36" />
                </div>

                <div className="flex flex-col gap-1 sm:gap-2">
                  <span className="text-xs text-[#A4A4A4]">Unrealized PnL</span>
                  <span
                    className="inline-flex items-center gap-1 text-sm whitespace-nowrap"
                    style={{
                      color: isGain ? palette.success : palette.danger,
                    }}
                  >
                    {pnlAmountText} ( {formatPercent(holding.pnlPct)} )
                    {isGain ? (
                      <ArrowUpRight size={16} className="text-[#4ED7B0]" />
                    ) : (
                      <ArrowDownRight size={16} className="text-[#FF6B6B]" />
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-auto">
                <button
                  type="button"
                  onClick={() => onBuySell?.(holding)}
                  className="flex h-8 w-full items-center justify-center rounded-lg bg-[#215EEC] text-sm font-medium text-neutral-100 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#215EEC]/60 focus:ring-offset-0 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {buySellLabel}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    );
  })();

  return (
    <section
      className={`w-full max-w-[1288px] rounded-2xl bg-[#16171D] px-3 py-3 sm:px-3 sm:py-4 ${className}`}
    >
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-normal text-white">My holding assets</h2>
        <span className="text-xs text-[#7E7E7E]">Preview layout</span>
      </header>

      <div className="mt-4 space-y-3">{content}</div>

      <footer className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-medium text-[#A4A4A4]">Total : {totalAssets} Assets</span>
        {showPagination && (
          <Pagination page={activePage} totalPages={totalPages} onSelect={changePage} />
        )}
      </footer>
    </section>
  );
}

export type { HoldingItem, HoldingResponsiveProps };
