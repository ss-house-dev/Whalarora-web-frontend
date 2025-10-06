'use client';

import Image from 'next/image';
import { PieChart } from '@mui/x-charts/PieChart';
import type { ChartsItemContentProps } from '@mui/x-charts/ChartsTooltip';
import Link from 'next/link';
import React from 'react';
import type { AllocationSlice } from '../types';


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

const sanitizeNumber = (value: number) => (Number.isFinite(value) ? value : 0);

const formatPercent = (ratio: number) => `${percentFormatter.format(sanitizeNumber(ratio))}%`;

const formatCurrencyValue = (value: number) => currencyFormatter.format(sanitizeNumber(value));

const formatSignedCurrency = (value: number) => {
  const normalized = sanitizeNumber(value);
  const base = currencyFormatter.format(Math.abs(normalized));
  if (normalized > 0) return `+${base}`;
  if (normalized < 0) return `-${base}`;
  return base;
};

const formatSignedPercent = (value: number) => {
  const normalized = sanitizeNumber(value);
  const base = percentFormatter.format(Math.abs(normalized));
  if (normalized > 0) return `+${base}%`;
  if (normalized < 0) return `-${base}%`;
  return `${base}%`;
};

const getPnlColor = (pnlValue: number) => {
  if (pnlValue > 0) return '#4ED7B0';
  if (pnlValue < 0) return '#FF6B6B';
  return '#A4A4A4';
};

const isOtherSlice = (slice: AllocationSlice) =>
  slice.isOther === true || slice.symbol.toLowerCase() === 'other';

const DEFAULT_OTHER_ICON = '/currency-icons/default-coin.svg';

const getSliceIconUrl = (slice: AllocationSlice) => {
  if (slice.iconUrl) return slice.iconUrl;
  if (isOtherSlice(slice)) return DEFAULT_OTHER_ICON;
  return undefined;
};

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
  const orderedSlices = React.useMemo(() => {
    return [...slices]
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
  }, [slices]);

  if (orderedSlices.length === 0) {
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
          <Link href="/main/trading">
            <button className="py-2 px-4 bg-[#225FED] text-white text-sm rounded-lg cursor-pointer">
              Start trading
            </button>
          </Link>
        </div>
      </section>
    );
  }

  const renderSliceIcon = (slice: AllocationSlice) => {
    const iconUrl = getSliceIconUrl(slice);
    if (iconUrl) {
      return <Image src={iconUrl} alt={`${slice.symbol} icon`} width={24} height={24} />;
    }
    return <span className="text-xs font-medium text-white">?</span>;
  };

  const CustomTooltip = ({ itemData }: ChartsItemContentProps<'pie'>) => {
    const slice = orderedSlices[itemData.dataIndex];
    if (!slice) return null;

    let tooltipValue = slice.value;
    let tooltipPnlValue = slice.pnlValue;
    let tooltipPnlPercent = slice.pnlPercent;

    if (isOtherSlice(slice) && slice.otherHoldings && slice.otherHoldings.length > 0) {
      const totalValue = slice.otherHoldings.reduce(
        (acc, holding) => acc + sanitizeNumber(holding.value),
        0
      );
      const totalCost = slice.otherHoldings.reduce(
        (acc, holding) => acc + sanitizeNumber(holding.cost),
        0
      );
      const calculatedPnlValue = totalValue - totalCost;
      const calculatedPnlPercent = totalCost > 0 ? (calculatedPnlValue / totalCost) * 100 : 0;

      tooltipValue = totalValue;
      tooltipPnlValue = calculatedPnlValue;
      tooltipPnlPercent = calculatedPnlPercent;
    }

    return (
      <div className="flex flex-col gap-2 rounded-lg border border-[#A4A4A4] bg-[#1F2029] p-2 text-white shadow-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center">
              {renderSliceIcon(slice)}
            </span>
            <span className="text-xs text-white">{slice.symbol}</span>
          </div>
          <span className="rounded-lg bg-[rgba(34,95,237,0.20)] px-2 py-1 text-[10px] text-white">
            {formatPercent(slice.percentage)}
          </span>
        </div>
        <div className="text-[10px] text-[#7E7E7E]">Value (USDT)</div>
        <div className="text-[10px] text-white">{formatCurrencyValue(tooltipValue)}</div>
        <div className="text-[10px] " style={{ color: getPnlColor(tooltipPnlValue) }}>
          {formatSignedCurrency(tooltipPnlValue)} ({formatSignedPercent(tooltipPnlPercent)})
        </div>
      </div>
    );
  };

  return (
    <section className={mergeClassNames(SECTION_CLASS, className)}>
      <div className="allocation-layout flex flex-col items-center gap-5 lg:flex-row lg:items-start lg:gap-4 xl:items-center xl:gap-10">
        <div className="chart-container relative mx-auto flex w-[200px] flex-shrink-0 items-center justify-center sm:w-[220px] lg:mx-0 lg:ml-0 lg:w-[184px] xl:ml-[72px] xl:w-[240px]">
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

        <div className="allocation-legend flex w-full flex-col items-center gap-4 py-0 lg:max-w-[208px] lg:items-start">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-4 justify-items-start mx-auto sm:gap-x-8 sm:gap-y-5 lg:mx-0 lg:w-full lg:grid-cols-1 lg:gap-y-2">
            {orderedSlices.map((slice) => (
              <li
                key={slice.id}
                className="flex items-center gap-2 text-[10px] text-white sm:text-sm"
              >
                <span
                  className="flex h-3 w-3 rounded-[4px] border"
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
                    ) : null}
                  </span>
                )}
                <span className={`text-[10px] text-white ${isOtherSlice(slice) ? 'ml-2' : ''}`}>
                  {slice.symbol}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AssetsAllocationDonut;

