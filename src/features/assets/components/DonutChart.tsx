import React, { useState, useRef } from 'react';
import { DonutChartData } from '../types/donut-chart';
import { formatCurrency, formatPercentage } from '../utils/donut-chart-utils';

interface DonutChartProps {
  data: DonutChartData[];
  totalHoldingValue: number;
}

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const getArcPath = (
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) => {
  const start = polarToCartesian(x, y, outerRadius, endAngle);
  const end = polarToCartesian(x, y, outerRadius, startAngle);
  const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);

  const angleDiff = endAngle - startAngle;
  const largeArcFlag = angleDiff <= 180 ? '0' : '1';

  return [
    'M',
    start.x,
    start.y,
    'A',
    outerRadius,
    outerRadius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'L',
    innerEnd.x,
    innerEnd.y,
    'A',
    innerRadius,
    innerRadius,
    0,
    largeArcFlag,
    1,
    innerStart.x,
    innerStart.y,
    'Z',
  ].join(' ');
};

const CHART_SIZE = 192;
const CX = CHART_SIZE / 2;
const CY = CHART_SIZE / 2;
const INNER_RADIUS = 46;
const OUTER_RADIUS = 80;
const HIGHLIGHT_OFFSET = 5;
const OUTLINE_COLOR = '#121119';
const BASE_BACKGROUND_COLOR = '#121119';
const OUTLINE_RING_COLOR = '#7E7E7E';
const BASE_SHADOW = '0px 4px 4px rgba(0, 0, 0, 0.25)';

const DonutChart: React.FC<DonutChartProps> = ({ data, totalHoldingValue }) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[#7E7E7E]">
        No data to display
      </div>
    );
  }

  const seriesData = data.map((item) => ({
    id: item.id,
    value: item.value,
    label: item.label,
    color: item.color,
    ratio: item.ratio,
  }));

  const totalAssets = data.length;
  const chartLabel = `Asset Allocation Donut Chart showing ${totalAssets} assets totaling ${formatCurrency(totalHoldingValue)}.`;
  const hoveredData = hoveredSlice ? seriesData.find((d) => d.id === hoveredSlice) : null;

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) {
      return;
    }

    if (!hoveredSlice) {
      setTooltipPos(null);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  let currentAngle = 0;

  return (
    <div
      ref={containerRef}
      className="relative size-56"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setHoveredSlice(null);
        setTooltipPos(null);
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          backgroundColor: BASE_BACKGROUND_COLOR,
          boxShadow: BASE_SHADOW,
          outline: `1px solid ${OUTLINE_RING_COLOR}`,
          outlineOffset: -0.5,
        }}
        aria-hidden
      />

      <svg
        className="absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2"
        height={CHART_SIZE}
        width={CHART_SIZE}
        viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
        onClick={() => setSelectedSlice(null)}
        aria-label={chartLabel}
        role="img"
      >
        {seriesData.map((slice) => {
          const sliceAngle = slice.ratio * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + sliceAngle;
          currentAngle = endAngle;

          const isHighlighted = hoveredSlice === slice.id || selectedSlice === slice.id;
          const currentOuterRadius = isHighlighted ? OUTER_RADIUS + HIGHLIGHT_OFFSET : OUTER_RADIUS;

          return (
            <path
              key={slice.id}
              d={getArcPath(CX, CY, INNER_RADIUS, currentOuterRadius, startAngle, endAngle)}
              fill={slice.color}
              stroke={OUTLINE_COLOR}
              strokeWidth={1.5}
              strokeLinejoin="round"
              onMouseEnter={() => setHoveredSlice(slice.id)}
              onMouseLeave={() => {
                setHoveredSlice(null);
                setTooltipPos(null);
              }}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedSlice(slice.id);
              }}
              style={{
                transition: 'all 120ms ease-out',
                cursor: 'pointer',
                opacity:
                  (hoveredSlice && hoveredSlice !== slice.id) ||
                  (selectedSlice && selectedSlice !== slice.id)
                    ? 0.5
                    : 1,
              }}
              aria-label={`${slice.label}: ${formatPercentage(slice.ratio)}`}
            />
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="font-['Alexandria'] text-sm font-normal leading-tight text-white">
          Allocation
        </span>
        <span className="font-['Alexandria'] text-xs font-normal leading-none text-palatte-color-netural-gray-GR300">
          {totalAssets} Assets
        </span>
      </div>

      {hoveredData && tooltipPos && (
        <div
          id="donut-chart-tooltip"
          className="flex min-w-[156px] flex-col gap-1 text-xs font-normal leading-tight"
          style={{
            position: 'absolute',
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, calc(-100% - 12px))',
            backgroundColor: BASE_BACKGROUND_COLOR,
            color: '#FFFFFF',
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1px solid ${OUTLINE_RING_COLOR}`,
            boxShadow: BASE_SHADOW,
            zIndex: 40,
            pointerEvents: 'none',
          }}
        >
          <span className="font-['Alexandria'] text-sm font-normal leading-tight">
            {hoveredData.label}
          </span>
          <div className="flex justify-between font-['Alexandria'] text-xs font-normal leading-tight text-[#7FFFDB]">
            <span>Value</span>
            <span>{formatCurrency(hoveredData.value)}</span>
          </div>
          <div className="flex justify-between font-['Alexandria'] text-xs font-normal leading-tight text-[#7FFFDB]">
            <span>Share</span>
            <span>{formatPercentage(hoveredData.ratio)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonutChart;
