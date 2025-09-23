'use client';
import { useMemo, useState } from 'react';

import HoldingAssetsTable from './HoldingAssetsTable';
import { AssetCard } from './AssetCard';

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
  loadingMessage,
  error,
}: HoldingAssetsSectionProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const handleTradeClick = (symbol: string) => {
    // TODO: Hook up trade modal / navigation when ready
    console.log('Opening trade modal for:', symbol);
  };

  const containerClass = 'flex h-64 items-center justify-center rounded-xl border border-[#3A3B44] bg-[#1F2029]';

  const hasError = Boolean(error);
  const isLoadingData = isLoading;
  const hasData = !isLoadingData && !hasError && rows.length > 0;
  const hasNoData = !isLoadingData && !hasError && rows.length === 0;

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
          <div className={containerClass}>
            <div className="text-sm text-slate-300">{loadingMessage || 'Loading...'}</div>
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
                className="mx-auto w-full"
              />
            ))}
          </div>
        )}
      </div>
    </HoldingAssetsTable>
  );
}

