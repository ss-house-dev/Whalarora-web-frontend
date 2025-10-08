'use client';

import Image from 'next/image';
import { PieChart } from '@mui/x-charts/PieChart';
import type { ChartsItemContentProps } from '@mui/x-charts/ChartsTooltip';
import Link from 'next/link';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';

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
const HIGHLIGHT_RADIUS = 4;
const CHART_MARGIN = 0;
const CHART_SIZE = (OUTER_RADIUS + HIGHLIGHT_RADIUS + CHART_MARGIN) * 2;
const COLOR_PRIORITY = ['#133482', '#5490D9', '#225FED', '#715AFF', '#A682FF', '#57CFE1'];
const TOOLTIP_MARGIN = 12;

export function AssetsAllocationDonut({
  slices,
  totalAssetCount,
  className,
}: AssetsAllocationDonutProps) {
  const [lockedIndex, setLockedIndex] = useState<number | null>(null);
  const [targetTooltipPosition, setTargetTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [displayTooltipPosition, setDisplayTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [tooltipPlacement, setTooltipPlacement] = useState<'above' | 'below'>('above');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<{ type: string; time: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        lockedIndex !== null &&
        chartContainerRef.current &&
        !chartContainerRef.current.contains(event.target as Node)
      ) {
        setLockedIndex(null);
        setTargetTooltipPosition(null);
        setDisplayTooltipPosition(null);
      }
    };

    if (lockedIndex !== null) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [lockedIndex]);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      lastInteractionRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (
      lockedIndex === null ||
      !targetTooltipPosition ||
      !chartContainerRef.current ||
      !tooltipRef.current
    ) {
      return;
    }

    // Keep tooltip inside the chart and flip below when there is not enough room above
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const containerRect = chartContainerRef.current.getBoundingClientRect();

    let nextPlacement: 'above' | 'below' = 'above';
    const projectedTop =
      containerRect.top + targetTooltipPosition.y - tooltipRect.height - TOOLTIP_MARGIN;
    if (projectedTop < TOOLTIP_MARGIN) {
      nextPlacement = 'below';
    }

    const minX = TOOLTIP_MARGIN + tooltipRect.width / 2;
    const maxX = containerRect.width - TOOLTIP_MARGIN - tooltipRect.width / 2;
    const clampedX = Math.min(Math.max(targetTooltipPosition.x, minX), Math.max(minX, maxX));

    let clampedY = targetTooltipPosition.y;
    if (nextPlacement === 'above') {
      const minY = tooltipRect.height + TOOLTIP_MARGIN;
      clampedY = Math.max(targetTooltipPosition.y, minY);
    } else {
      const maxY = containerRect.height - TOOLTIP_MARGIN - tooltipRect.height;
      clampedY = Math.min(
        Math.max(targetTooltipPosition.y, TOOLTIP_MARGIN),
        Math.max(TOOLTIP_MARGIN, maxY)
      );
    }

    if (
      !displayTooltipPosition ||
      displayTooltipPosition.x !== clampedX ||
      displayTooltipPosition.y !== clampedY
    ) {
      setDisplayTooltipPosition({ x: clampedX, y: clampedY });
    }

    if (tooltipPlacement !== nextPlacement) {
      setTooltipPlacement(nextPlacement);
    }
  }, [displayTooltipPosition, lockedIndex, targetTooltipPosition, tooltipPlacement]);

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
          <Link href="/main/trading">
            <button className="py-2 px-4 bg-[#225FED] text-white text-sm rounded-lg cursor-pointer">
              Start trading
            </button>
          </Link>
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

    return (
      <div className="flex flex-col gap-2 rounded-lg border border-[#A4A4A4] bg-[#1F2029] p-2 text-white shadow-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {slice.symbol !== 'Other' ? (
              <>
                <span className="flex h-6 w-6 items-center justify-center">
                  {renderSliceIcon(slice)}
                </span>
                <span className="text-xs text-white">{slice.symbol}</span>
              </>
            ) : (
              <span className="text-xs text-white w-[3.5rem] text-left">{slice.symbol}</span>
            )}
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

  const handleSliceClick = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    // Prevent default touch behavior (e.g., scrolling)
    event.preventDefault();

    // Prevent duplicate events on touch devices (touch + click firing together)
    const eventType = 'touches' in event ? 'touch' : 'mouse';
    const now = Date.now();

    if (lastInteractionRef.current) {
      const timeDiff = now - lastInteractionRef.current.time;
      // If same event type within 50ms or different event type within 500ms, ignore
      if (
        (lastInteractionRef.current.type === eventType && timeDiff < 50) ||
        (lastInteractionRef.current.type !== eventType && timeDiff < 500)
      ) {
        return;
      }
    }

    lastInteractionRef.current = { type: eventType, time: now };

    // If tooltip is locked, close it
    if (lockedIndex !== null) {
      setLockedIndex(null);
      setTargetTooltipPosition(null);
      setDisplayTooltipPosition(null);
      return;
    }

    const target = event.target as HTMLElement;
    if (target.tagName !== 'path') return;

    const arcElement = target.closest('.MuiPieArc-root');
    if (!arcElement || !arcElement.parentElement) return;

    const allArcs = arcElement.parentElement.querySelectorAll('.MuiPieArc-root');
    const clickedIdx = Array.from(allArcs).indexOf(arcElement);

    if (clickedIdx === -1) return;

    if (chartContainerRef.current) {
      // Wait for MUI tooltip to position itself, then capture its position
      setTimeout(() => {
        const muiTooltip = document.querySelector('.MuiChartsTooltip-root');
        if (muiTooltip && chartContainerRef.current) {
          const tooltipRect = muiTooltip.getBoundingClientRect();
          const containerRect = chartContainerRef.current.getBoundingClientRect();

          // Calculate center of tooltip relative to container
          const x = tooltipRect.left + tooltipRect.width / 2 - containerRect.left;
          const y = tooltipRect.top + tooltipRect.height / 2 - containerRect.top;

          const position = { x, y };
          setTargetTooltipPosition(position);
          setDisplayTooltipPosition(position);
          setTooltipPlacement('above');
        }
      }, 10);
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      setLockedIndex((prevIndex) => {
        if (prevIndex === clickedIdx) {
          setTargetTooltipPosition(null);
          setDisplayTooltipPosition(null);
          return null;
        }
        return clickedIdx;
      });
    }, 50);
  };

  return (
    <section className={mergeClassNames(SECTION_CLASS, className)}>
      <div className="allocation-layout flex flex-col items-center gap-5 lg:flex-row lg:items-start lg:gap-4 xl:items-center xl:gap-10">
        <div
          ref={chartContainerRef}
          className="chart-container relative mx-auto flex w-[200px] flex-shrink-0 items-center justify-center sm:w-[220px] lg:mx-0 lg:ml-0 lg:w-[184px] xl:ml-[72px] xl:w-[240px]"
          onTouchStart={handleSliceClick}
          onClick={handleSliceClick}
        >
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
                data: orderedSlices.map((slice, index) => ({
                  id: String(slice.id),
                  value: slice.value,
                  label: slice.symbol,
                  color: slice.color,
                  ...(lockedIndex !== null && lockedIndex !== index ? { faded: true } : {}),
                })),
                innerRadius: 55,
                outerRadius: OUTER_RADIUS,
                cornerRadius: 0,
                paddingAngle: 0.5,
                highlightScope: { faded: 'series', highlighted: 'item' },
                highlighted: { additionalRadius: HIGHLIGHT_RADIUS },
              },
            ]}
            tooltip={{ trigger: lockedIndex === null ? 'item' : 'none' }}
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
                  transition:
                    'stroke 0.3s ease, stroke-width 0.3s ease, filter 0.3s ease, opacity 0.3s ease',
                },
                '&:hover path': {
                  stroke: '#FFFFFF !important',
                  strokeWidth: '2px !important',
                  filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))',
                },
                '&.Mui-faded path': {
                  opacity: 0.3,
                },
              },
            }}
          />

          {lockedIndex !== null && orderedSlices[lockedIndex] && displayTooltipPosition && (
            <div
              ref={tooltipRef}
              className="absolute"
              style={{
                top: displayTooltipPosition.y,
                left: displayTooltipPosition.x,
                transform:
                  tooltipPlacement === 'above'
                    ? `translate(-50%, calc(-100% - ${TOOLTIP_MARGIN}px))`
                    : `translate(-50%, ${TOOLTIP_MARGIN}px)`,
                zIndex: 1000,
                pointerEvents: 'none',
              }}
            >
              <div className="flex flex-col gap-2 rounded-lg border border-[#A4A4A4] bg-[#1F2029] p-2 text-white shadow-2xl">
                {(() => {
                  const slice = orderedSlices[lockedIndex];
                  return (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {slice.symbol !== 'Other' ? (
                            <>
                              <span className="flex h-6 w-6 items-center justify-center">
                                {renderSliceIcon(slice)}
                              </span>
                              <span className="text-xs text-white">{slice.symbol}</span>
                            </>
                          ) : (
                            <span className="text-xs text-white w-[3.5rem] text-left">
                              {slice.symbol}
                            </span>
                          )}
                        </div>
                        <span className="rounded-lg bg-[rgba(34,95,237,0.20)] px-2 py-1 text-[10px] text-white">
                          {formatPercent(slice.percentage)}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#7E7E7E]">Value (USDT)</div>
                      <div className="text-[10px] text-white">
                        {formatCurrencyValue(slice.value)}
                      </div>
                      <div className="text-[10px]" style={{ color: getPnlColor(slice.pnlValue) }}>
                        {formatSignedCurrency(slice.pnlValue)} (
                        {formatSignedPercent(slice.pnlPercent)})
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

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
                <span className={`text-[10px] text-white ${isOtherSlice(slice) ? '' : ''}`}>
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
