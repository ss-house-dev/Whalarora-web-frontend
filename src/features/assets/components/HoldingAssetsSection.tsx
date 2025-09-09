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
}

export default function HoldingAssetsSection({
  rows,
  pageSize = 10,
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

  return (
    <HoldingAssetsTable
      title="My holding assets"
      totalAssets={rows.length}
      totalPages={totalPages}
      initialPage={1}
      onPageChange={setPage}
    >
      <div className="flex flex-col space-y-[16px]">
        {pagedRows.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-slate-400">No holding assets found.</p>
          </div>
        ) : (
          pagedRows.map((row) => (
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
          ))
        )}
      </div>
    </HoldingAssetsTable>
  );
}