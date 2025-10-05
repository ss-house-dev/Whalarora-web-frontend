'use client';

import Image from 'next/image';
import { PieChart } from '@mui/x-charts/PieChart';
import type { ChartsItemContentProps } from '@mui/x-charts/ChartsTooltip';

export type AllocationSlice = {
  id: string;
  symbol: string;
  name?: string;
  value: number;
  percentage: number;
  pnlValue: number;
  pnlPercent: number;
  iconUrl?: string;
  color: string;
  isOther?: boolean;
};

const mergeClassNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

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
const formatCurrencyValue = (value: number) => currencyFormatter.format(value);

const formatSignedCurrency = (value: number) => {
  const base = formatCurrencyValue(value);
  if (value > 0) return `+${base}`;
  if (value < 0) return `-${base}`;
  return base;
};

const formatSignedPercent = (value: number) => {
  const base = percentFormatter.format(Math.abs(value));
  if (value > 0) return `+${base}%`;
  if (value < 0) return `-${base}%`;
  return `${base}%`;
};

const getPnlColor = (pnlValue: number) => {
  if (pnlValue > 0) return '#4ED7B0';
  if (pnlValue < 0) return '#FF6B6B';
  return '#A4A4A4';
};

const EMPTY_SECTION_CLASS =
  'w-full rounded-2xl bg-[#16171D] px-4 py-3 text-center text-sm text-[#A4A4A4] shadow-lg';
const SECTION_CLASS = 'w-full rounded-2xl bg-[#16171D] px-6 py-5 text-white shadow-lg';
const CHART_SIZE = 260;

export function AssetsAllocationDonut({
  slices,
  totalAssetCount,
  className,
}: AssetsAllocationDonutProps) {
  if (slices.length === 0) {
    return (
      <section className={mergeClassNames(EMPTY_SECTION_CLASS, className)}>
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
      <div className="flex w-[224px] flex-col gap-2 rounded-2xl border border-[#3A3B44] bg-[#1B1C24] px-4 py-3 text-white shadow-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#151620]">
              {slice.iconUrl ? (
                <Image src={slice.iconUrl} alt={`${slice.symbol} icon`} width={24} height={24} />
              ) : (
                <span className="text-sm font-medium text-white">?</span>
              )}
            </span>
            <span className="text-sm font-medium text-white">{slice.symbol}</span>
          </div>
          <span className="rounded-full bg-[rgba(42,76,181,0.45)] px-2.5 py-1 text-[11px] font-medium text-white">
            {formatPercent(slice.percentage)}
          </span>
        </div>
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#7E7E7E]">
          Value (USDT)
        </div>
        <div className="text-sm font-semibold text-white">{formatCurrencyValue(slice.value)}</div>
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#7E7E7E]">
          Unrealized PnL (USDT)
        </div>
        <div className="text-xs font-semibold" style={{ color: getPnlColor(slice.pnlValue) }}>
          {formatSignedCurrency(slice.pnlValue)} ({formatSignedPercent(slice.pnlPercent)})
        </div>
      </div>
    );
  };

  return (
    <section className={mergeClassNames(SECTION_CLASS, className)}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
        <div className="relative mx-auto flex h-[260px] w-[260px] flex-shrink-0 items-center justify-center lg:mx-0">
          <PieChart
            width={CHART_SIZE}
            height={CHART_SIZE}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            series={[
              {
                data: slices.map((slice) => ({
                  id: String(slice.id),
                  value: slice.value,
                  label: slice.symbol,
                  color: slice.color,
                })),
                innerRadius: 88,
                outerRadius: 118,
                cornerRadius: 6,
                paddingAngle: 1.2,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { innerRadius: 82, color: 'rgba(52, 60, 71, 0.55)' },
              },
            ]}
            slotProps={{
              legend: { hidden: true },
              pieArc: { className: 'allocation-donut-arc' },
            }}
            tooltip={{
              trigger: 'item',
              slots: { itemContent: TooltipContent },
            }}
            sx={{
              '& .allocation-donut-arc path': {
                stroke: 'transparent',
                transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
              },
              '& .allocation-donut-arc:hover path': {
                stroke: '#FFFFFF',
                strokeWidth: 2,
              },
              '& .MuiPieArc-root.MuiChartsHighlighted path': {
                stroke: '#FFFFFF',
                strokeWidth: 2,
              },
              '& .MuiPieArc-root.MuiCharts-highlighted path': {
                stroke: '#FFFFFF',
                strokeWidth: 2,
              },
            }}
          />

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-base font-medium text-white">Allocation</span>
            <span className="text-sm font-medium text-[#73747C]">{totalAssetCount} Assets</span>
          </div>
        </div>

        <div className="flex w-full max-w-[208px] flex-col gap-4">
          <h3 className="text-base font-medium text-white">Allocation</h3>
          <ul className="space-y-3">
            {slices.map((slice) => (
              <li key={slice.id} className="flex items-center gap-3 text-sm text-white">
                <span
                  className="flex h-3 w-3 flex-shrink-0 rounded-sm"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden
                />
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1B1D26]">
                  {slice.iconUrl ? (
                    <Image src={slice.iconUrl} alt={`${slice.symbol} icon`} width={24} height={24} />
                  ) : (
                    <span className="text-xs font-semibold text-white">?</span>
                  )}
                </span>
                <span className="text-sm font-medium text-white">{slice.symbol}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AssetsAllocationDonut;
