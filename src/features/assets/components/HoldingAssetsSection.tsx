'use client';
import { useMemo, useState } from 'react';
import clsx from 'clsx';

import HoldingAssetsTable from './HoldingAssetsTable';
import { AssetCard } from './AssetCard';
import { useHoldingDesktopBreakpoint } from '../hooks/useHoldingDesktopBreakpoint';

type Row = {
  id: string | number;
  symbol: string;
  name: string;
  amount: number;
  currentPrice: number;
  averageCost: number;
  value: number;
  pnlAbs: number;
  pnlPct: number;
};

interface HoldingAssetsSectionProps {
  rows: Row[];
  pageSize?: number;
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string;
}

export default function HoldingAssetsSection({
  rows,
  pageSize = 10,
  isLoading = false,
  error,
}: HoldingAssetsSectionProps) {
  const [page, setPage] = useState(1);
  const isDesktopLayout = useHoldingDesktopBreakpoint();

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const handleTradeClick = (symbol: string) => {
    // TODO: Hook up trade modal / navigation when ready
    console.log('Opening trade modal for:', symbol);
  };

  const containerClass =
    'flex h-64 items-center justify-center rounded-xl border border-[#3A3B44] bg-[#1F2029]';

  const hasError = Boolean(error);
  const isLoadingData = isLoading;
  const hasData = !isLoadingData && !hasError && rows.length > 0;
  const hasNoData = !isLoadingData && !hasError && rows.length === 0;

  const rowsContainerClasses = isDesktopLayout
    ? 'flex flex-col gap-3 pr-1'
    : 'grid gap-3 sm:grid-cols-2';

  const assetCardClassName = clsx('w-full', !isDesktopLayout && 'h-full');

  return (
    <HoldingAssetsTable
      title="My holding assets"
      totalAssets={rows.length}
      totalPages={totalPages}
      initialPage={1}
      onPageChange={setPage}
      showPagination
    >
      <div className="flex flex-col space-y-4">
        {isLoadingData && (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {hasError && (
          <div className={containerClass}>
            <div className="text-sm text-red-400">Error: {error}</div>
          </div>
        )}

        {hasNoData && (
          <div className={containerClass}>
            <p className="text-sm text-slate-300">No holding asset.</p>
          </div>
        )}

        {hasData && (
          <div className="flex flex-col gap-3">
            {isDesktopLayout && (
              <div className="sticky top-[-1] z-10 grid grid-cols-[288px_128px_128px_144px_144px_1fr] items-center gap-10 border-b border-[#2D3039] bg-[#16171D] px-4 py-2 text-[10.5px] tracking-[0.08em] text-[#A4A4A4]">
                <span className="text-left font-medium">Symbol</span>
                <span className="justify-self-center text-center font-medium">
                  Current price (USDT)
                </span>
                <span className="justify-self-center text-center font-medium">
                  Average cost (USDT)
                </span>
                <span className="justify-self-center text-center font-medium">Value (USDT)</span>
                <span className="justify-self-center text-center font-medium">
                  Unrealized PnL (USDT)
                </span>
                <span aria-hidden className="block" />
              </div>
            )}
            <div className={rowsContainerClasses}>
              {pagedRows.map((row) => (
                <AssetCard
                  key={row.id}
                  symbol={row.symbol}
                  name={row.name}
                  amount={row.amount}
                  currentPrice={row.currentPrice}
                  averageCost={row.averageCost}
                  value={row.value}
                  pnlAbs={row.pnlAbs}
                  pnlPct={row.pnlPct}
                  onBuySell={() => handleTradeClick(row.symbol)}
                  className={assetCardClassName}
                  isDesktopLayout={isDesktopLayout}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </HoldingAssetsTable>
  );
}
