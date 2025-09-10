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
    // เปิด trade modal หรือ redirect ไปหน้า trading
    console.log('Opening trade modal for:', symbol);
    // TODO: Implement trade modal logic
  };

  // กำหนดสถานะสำหรับการแสดงผล
  const hasError = !!error;
  const isLoadingData = isLoading;
  const hasData = !isLoadingData && !hasError && rows.length > 0;
  const hasNoData = !isLoadingData && !hasError && rows.length === 0;

  return (
    <HoldingAssetsTable
      title="My holding assets"
      totalAssets={rows.length} // ส่งจำนวนจริงเสมอ
      totalPages={totalPages} // ส่ง totalPages จริงเสมอ
      initialPage={1}
      onPageChange={setPage}
      showPagination={true} // แสดง pagination เสมอ
    >
      <div className="flex flex-col space-y-[16px]">
        {/* Loading state */}
        {isLoadingData && (
          <div className="flex justify-center items-center h-64">
            <div className="text-slate-300 text-sm">
              {loadingMessage || 'Loading...'}
            </div>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-400 text-sm">
              Error: {error}
            </div>
          </div>
        )}

        {/* No data state */}
        {hasNoData && (
          <div className="flex justify-center items-center h-64">
            <p className="text-slate-300 text-sm">No holding asset.</p>
          </div>
        )}

        {/* Data state */}
        {hasData && (
          <>
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
                className="mx-auto lg:w-[1220px] h-20 px-4 py-3 rounded-xl"
              />
            ))}
          </>
        )}
      </div>
    </HoldingAssetsTable>
  );
}