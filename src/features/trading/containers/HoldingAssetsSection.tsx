// HoldingAssetsSection.tsx
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

export default function HoldingAssetsSection({
  rows,
  pageSize = 10, // default page size
}: {
  rows: Row[];
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  return (
    <HoldingAssetsTable
      title="My holding assets"
      totalAssets={rows.length}
      totalPages={totalPages}
      initialPage={1}
      onPageChange={setPage}
      // showPagination: ใช้ค่าดีฟอลต์ true ตามไฟล์เดิม
    >
      <div className="flex flex-col space-y-[16px]">
        {pagedRows.map((r) => (
          <AssetCard
            key={r.id}
            symbol={r.symbol}
            name={r.name}
            amount={r.amount}
            currentPrice={r.currentPrice}
            averageCost={r.averageCost}
            value={r.value}
            pnlAbs={r.pnlAbs}
            pnlPct={r.pnlPct}
            onBuySell={() => {
              /* open trade modal */
            }}
            className="mx-auto lg:w-[1220px] h-20 px-4 py-3  rounded-xl"
          />
        ))}
      </div>
    </HoldingAssetsTable>
  );
}
