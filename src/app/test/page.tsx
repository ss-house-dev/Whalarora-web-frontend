"use client";

import HoldingAssetsSection from '@/features/trading/containers/HoldingAssetsSection';
import { useHoldingRows } from "@/features/wallet/hooks/useHoldingRows";

export default function TestPage() {
  const { data: rows, isLoading, isError, refetch } = useHoldingRows();

  if (isLoading) return <div className="p-6 text-slate-300">Loading...</div>;
  if (isError || !rows) {
    return (
      <div className="p-6 text-red-400">
        Load failed. <button className="underline" onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  return <HoldingAssetsSection rows={rows} pageSize={10} />;
}

