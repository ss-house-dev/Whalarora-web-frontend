'use client';

import TotalAssetsValueCard from '../components/TotalAssetsValueCard';
import AssetsAllocationDonut from '../components/AssetsAllocationDonut';
import { useAssetValuations } from '../contexts/AssetValuationContext';

export default function TotalAssetsValueContainer() {
  const {
    totalValue,
    totalCost,
    totalPnlValue,
    totalPnlPercent,
    allocationSlices,
    allocationAssetCount,
    isSummaryLoading,
    combinedError,
  } = useAssetValuations();

  return (
    <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-stretch">
      <TotalAssetsValueCard
        totalValue={totalValue}
        totalCost={totalCost}
        pnlValue={totalPnlValue}
        pnlPercent={totalPnlPercent}
        isLoading={isSummaryLoading}
        error={combinedError}
        className="w-full sm:max-w-none lg:max-w-[603px] lg:flex-[2]"
      />
      <AssetsAllocationDonut
        slices={allocationSlices}
        totalAssetCount={allocationAssetCount}
        className="lg:max-w-[678px] lg:flex-1"
      />
    </div>
  );
}
