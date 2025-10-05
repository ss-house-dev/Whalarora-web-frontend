'use client';

import { PieChart } from '@mui/x-charts/PieChart';
import type { ChartsItemContentProps } from '@mui/x-charts/ChartsTooltip';
import clsx from 'clsx';

export type AllocationSlice = {
  id: string;
  symbol: string;
  name?: string;
  value: number;
  percentage: number;
  color: string;
  isOther?: boolean;
};

type AssetsAllocationDonutProps = {
  slices: AllocationSlice[];
  totalAssetCount: number;
  className?: string;
};

const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatPercent = (ratio: number) => `${percentFormatter.format(ratio)}%`;
const formatCurrency = (value: number) => `${currencyFormatter.format(value)} USDT`;

export function AssetsAllocationDonut({
  slices,
  totalAssetCount,
  className = '',
}: AssetsAllocationDonutProps) {
  const hasSlices = slices.length > 0;

  if (!hasSlices) {
    return (
      <section
        className={clsx(
          'w-full rounded-2xl bg-[#16171D] px-4 py-3 text-center text-sm text-[#A4A4A4] shadow-lg',
          className
        )}
      >
        <div className="flex h-full min-h-[216px] items-center justify-center">
          <p>No holding asset.</p>
        </div>
      </section>
    );
  }


  const TooltipContent = ({ itemData }: ChartsItemContentProps<'pie'>) => {
    const slice = slices[itemData.dataIndex];
    if (!slice) return null;

    return (
      <div className="rounded-lg bg-[#1F2029] px-3 py-2 text-xs text-white shadow-lg">
        <p className="font-medium">{slice.symbol}</p>
        <p className="text-[#7E7E7E]">{slice.name ?? slice.symbol}</p>
        <p className="mt-1">{formatCurrency(slice.value)}</p>
        <p className="text-[#4ED7B0]">{formatPercent(slice.percentage)}</p>
      </div>
    );
  };

  return (
    <section
      className={clsx(
        'w-full rounded-2xl bg-[#16171D] px-4 py-5 shadow-lg text-white',
        className
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
        <div className="relative mx-auto flex items-center justify-center lg:mx-0">
          <PieChart
            width={240}
            height={240}
            series={[
              {
                data: slices.map((slice) => ({
                  id: String(slice.id),
                  value: slice.value,
                  label: slice.symbol,
                  color: slice.color,
                })),
                innerRadius: 78,
                outerRadius: 110,
                cornerRadius: 4,
                paddingAngle: 1.5,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { innerRadius: 70, color: 'rgba(52, 60, 71, 0.55)' },
              },
            ]}
            slotProps={{
              legend: { hidden: true },
            }}
            tooltip={{
              trigger: 'item',
              slots: { itemContent: TooltipContent },
            }}
          />

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm text-[#A4A4A4]">Allocation</span>
            <span className="text-lg font-semibold text-white">{totalAssetCount} Assets</span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-base font-medium text-white">Allocation</h3>
          <ul className="mt-4 space-y-3">
            {slices.map((slice) => (
              <li key={slice.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-3 w-3 rounded-full"
                    style={{ backgroundColor: slice.color }}
                    aria-hidden
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{slice.symbol}</span>
                    <span className="text-xs text-[#7E7E7E]">{slice.name ?? slice.symbol}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-[#A4A4A4]">
                  <p className="font-medium text-white">{formatPercent(slice.percentage)}</p>
                  <p>{formatCurrency(slice.value)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AssetsAllocationDonut;
