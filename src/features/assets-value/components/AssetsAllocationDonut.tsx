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
  const base = formatCurrencyValue(Math.abs(value));
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

const isOtherSlice = (slice: AllocationSlice) =>
  slice.isOther === true || slice.symbol.toLowerCase() === 'other';

const EMPTY_SECTION_CLASS =
  'w-full rounded-xl text-center text-sm text-[#A4A4A4] bg-[linear-gradient(84deg,#16171D_63.73%,#225FED_209.1%)]';
const SECTION_CLASS = 'w-full text-white';
const OUTER_RADIUS = 90;
const HIGHLIGHT_RADIUS = 10;
const CHART_MARGIN = 0;
const CHART_SIZE = (OUTER_RADIUS + HIGHLIGHT_RADIUS + CHART_MARGIN) * 2;
const COLOR_PRIORITY = ['#133482', '#5490D9', '#225FED', '#715AFF', '#A682FF', '#57CFE1'];

export function AssetsAllocationDonut({
  slices,
  totalAssetCount,
  className,
}: AssetsAllocationDonutProps) {
  if (slices.length === 0) {
    return (
      <section className={mergeClassNames(EMPTY_SECTION_CLASS, className)}>
        <div className="flex flex-col w-full h-full min-h-[196px] items-center justify-center space-y-3">
          <Image
            src="/assets/empty-state-port.svg"
            alt="Bitcoin"
            width={88}
            height={88}
            className="rounded-full"
          />
          <p className="text-xs">
            No holding Assets !<br />
            Start your trading journey now.
          </p>
          <button className="py-2 px-4 bg-[#225FED] text-white text-sm rounded-lg cursor-pointer">
            Start trading
          </button>
        </div>
      </section>
    );
  }

  const orderedSlices = [...slices]
    .sort((a, b) => {
      const aIsOther = isOtherSlice(a);
      const bIsOther = isOtherSlice(b);

      if (aIsOther && !bIsOther) return 1;
      if (!aIsOther && bIsOther) return -1;
      return b.percentage - a.percentage;
    })
    .map((slice, index) => ({
      ...slice,
      color: COLOR_PRIORITY[index] ?? slice.color,
    }));

  const CustomTooltip = ({ itemData }: ChartsItemContentProps<'pie'>) => {
    const slice = orderedSlices[itemData.dataIndex];
    if (!slice) return null;

    return (
      <div className="flex flex-col gap-2 rounded-lg border border-[#A4A4A4] bg-[#1F2029] p-2 text-white shadow-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {!isOtherSlice(slice) && (
              <span className="flex h-6 w-6 items-center justify-center">
                {slice.iconUrl ? (
                  <Image src={slice.iconUrl} alt={`${slice.symbol} icon`} width={24} height={24} />
                ) : (
                  <span className="text-xs font-medium text-white">?</span>
                )}
              </span>
            )}
            <span className="text-xs text-white">{slice.symbol}</span>
          </div>
          <span className="rounded-lg bg-[rgba(34,95,237,0.20)] px-2 py-1 text-[10px] text-white">
            {formatPercent(slice.percentage)}
          </span>
        </div>
        <div className="text-[10px] text-[#7E7E7E]">Value (USDT)</div>
        <div className="text-[10px] text-white">{formatCurrencyValue(slice.value)}</div>
        <div className="text-[10px] " style={{ color: getPnlColor(slice.pnlValue) }}>
          {formatSignedCurrency(slice.pnlValue)} ({formatSignedPercent(slice.pnlPercent)})
        </div>
      </div>
    );
  };

  return (
    <section className={mergeClassNames(SECTION_CLASS, className)}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
        <div className="relative ml-[72px] flex w-[240px] flex-shrink-0 items-center justify-center">
          <PieChart
            width={CHART_SIZE}
            height={CHART_SIZE}
            margin={{
              top: CHART_MARGIN,
              right: CHART_MARGIN,
              bottom: CHART_MARGIN,
              left: CHART_MARGIN,
            }}
            series={[
              {
                data: orderedSlices.map((slice) => ({
                  id: String(slice.id),
                  value: slice.value,
                  label: slice.symbol,
                  color: slice.color,
                })),
                innerRadius: 55,
                outerRadius: OUTER_RADIUS,
                cornerRadius: 0,
                paddingAngle: 0.5,
                highlightScope: { faded: 'none', highlighted: 'item' },
                highlighted: { additionalRadius: HIGHLIGHT_RADIUS },
              },
            ]}
            tooltip={{ trigger: 'item' }}
            slots={{
              itemContent: CustomTooltip,
            }}
            slotProps={{
              legend: { hidden: true },
              popper: {
                sx: {
                  '& .MuiChartsTooltip-root': {
                    backgroundColor: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                  },
                  '& .MuiChartsTooltip-table': {
                    display: 'none',
                  },
                },
              },
              pieArc: {
                style: {
                  stroke: 'none',
                  strokeWidth: 0,
                },
              },
            }}
            sx={{
              '& .MuiChartsTooltip-root': {
                backgroundColor: 'transparent !important',
                border: 'none !important',
                boxShadow: 'none !important',
              },
              '& .MuiChartsTooltip-table': {
                display: 'none !important',
              },
              '& .MuiPieArc-root': {
                cursor: 'pointer',
                '& path': {
                  stroke: 'none !important',
                  strokeWidth: '0 !important',
                  transition: 'stroke 0.3s ease, stroke-width 0.3s ease, filter 0.3s ease',
                },
                '&:hover path': {
                  stroke: '#FFFFFF !important',
                  strokeWidth: '2px !important',
                  filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))',
                },
              },
            }}
          />

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-sm font-medium text-white">Allocation</span>
            <span className="text-xs font-medium text-[#73747C]">{totalAssetCount} Assets</span>
          </div>
        </div>

        <div className="flex w-full max-w-[208px] flex-col gap-4 py-0">
          <ul className="space-y-2">
            {orderedSlices.map((slice) => (
              <li key={slice.id} className="flex items-center gap-2 text-sm text-white">
                <span
                  className="flex h-3 w-3 border rounded-[4px]"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden
                />
                {!isOtherSlice(slice) && (
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
                    {slice.iconUrl ? (
                      <Image
                        src={slice.iconUrl}
                        alt={`${slice.symbol} icon`}
                        width={24}
                        height={24}
                      />
                    ) : (
                      <span className="text-xs font-semibold text-white">?</span>
                    )}
                  </span>
                )}
                <span className="text-[10px] text-white">{slice.symbol}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AssetsAllocationDonut;
