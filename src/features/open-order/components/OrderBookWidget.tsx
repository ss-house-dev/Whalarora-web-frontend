// src/features/open-order/components/OrderBookWidget.tsx
import React from 'react';

type Side = 'bid' | 'ask';

type SideContent = {
  label?: string;
  amountLabel?: string;
  price?: string | null;
  amount?: string | null;
  amountSymbol?: string | null;
};

export interface OrderBookWidgetProps {
  bid?: SideContent;
  ask?: SideContent;
  activeSide?: Side | null;
  disabled?: boolean;
  onBidClick?: () => void;
  onAskClick?: () => void;
  className?: string;
}

// Constants
const PLACEHOLDER = '--';
const COLORS = {
  BID: '#2FACA2',
  ASK: '#D84C4C',
  LABEL: '#7E7E7E',
  AMOUNT: '#FFFFFF',
  BORDER: '#474747',
  BID_OVERLAY: 'rgba(255, 255, 255, 0.08)',
  ASK_OVERLAY: 'rgba(255, 255, 255, 0.08)',
  BID_ACTIVE_OVERLAY: 'rgba(255, 255, 255, 0.16)',
  ASK_ACTIVE_OVERLAY: 'rgba(255, 255, 255, 0.16)',
} as const;

// Utility functions
function hasValue(value?: string | null): boolean {
  return value != null && value.trim().length > 0;
}

// Components
function AmountLabel({
  side,
  label,
  symbol,
}: {
  side: Side;
  label?: string;
  symbol?: string | null;
}) {
  const amountSymbol = (symbol ?? '').trim();
  const hasAmountSymbol = amountSymbol.length > 0;
  const isLongAmountSymbol = hasAmountSymbol && amountSymbol.length > 4;

  const rawAmountLabel = label ?? (hasAmountSymbol ? `Amount (${amountSymbol})` : 'Amount');
  const compactAmountLabel = isLongAmountSymbol
    ? rawAmountLabel.replace(/\s*\([^)]*\)\s*/, '').trim() || rawAmountLabel
    : rawAmountLabel;

  const baseClasses = 'text-[11px] font-normal leading-none font-[Alexandria]';
  const alignmentClasses = side === 'bid' ? 'text-right' : 'text-left';
  const layoutClasses = isLongAmountSymbol
    ? 'inline-flex flex-col gap-[2px] mb-2.5'
    : 'whitespace-nowrap';

  const className = `${baseClasses} ${alignmentClasses} ${layoutClasses}`;

  return (
    <span className={className} style={{ color: COLORS.LABEL }}>
      {isLongAmountSymbol ? (
        <>
          <span>{compactAmountLabel}</span>
          <span>({amountSymbol})</span>
        </>
      ) : (
        rawAmountLabel
      )}
    </span>
  );
}

function OrderBookSide({
  side,
  content,
  isActive,
  disabled,
  onClick,
}: {
  side: Side;
  content: SideContent | undefined;
  isActive: boolean;
  disabled: boolean;
  onClick?: () => void;
}) {
  const [isPressing, setIsPressing] = React.useState(false);

  // Event handlers
  const handlePointerDown = () => !disabled && setIsPressing(true);
  const handlePointerUp = () => setIsPressing(false);
  const handleBlur = () => setIsPressing(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled || event.repeat) return;
    if (['Enter', ' ', 'Space', 'Spacebar'].includes(event.key)) {
      setIsPressing(true);
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (['Enter', ' ', 'Space', 'Spacebar'].includes(event.key)) {
      setIsPressing(false);
    }
  };

  React.useEffect(() => {
    if (disabled) setIsPressing(false);
  }, [disabled]);

  // Data processing
  const labelText = content?.label ?? (side === 'bid' ? 'Bid' : 'Ask');
  const priceValue =
    !disabled && hasValue(content?.price) ? String(content?.price).trim() : PLACEHOLDER;
  const amountValue =
    !disabled && hasValue(content?.amount) ? String(content?.amount).trim() : PLACEHOLDER;

  // Styling
  const isPlaceholderPrice = priceValue === PLACEHOLDER;
  const isPlaceholderAmount = amountValue === PLACEHOLDER;

  const highlightColor = COLORS[side.toUpperCase() as keyof typeof COLORS];
  const priceColor = isPlaceholderPrice ? COLORS.LABEL : highlightColor;
  const amountColor = isPlaceholderAmount ? COLORS.LABEL : COLORS.AMOUNT;

  const overlayColor = isPressing
    ? COLORS[`${side.toUpperCase()}_ACTIVE_OVERLAY` as keyof typeof COLORS]
    : COLORS[`${side.toUpperCase()}_OVERLAY` as keyof typeof COLORS];

  const roundingClass = side === 'bid' ? 'rounded-l-xl' : 'rounded-r-xl';

  // Base classes
  const buttonClasses = [
    'group relative h-full flex-1 overflow-hidden px-2 sm:px-3 py-1 transition',
    'focus-visible:outline-offset-[-2px] min-w-0',
    roundingClass,
    disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
  ].join(' ');

  const overlayClasses = [
    'pointer-events-none absolute inset-0 transition-opacity',
    roundingClass,
    disabled
      ? 'opacity-0'
      : isActive
        ? 'opacity-100'
        : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
  ].join(' ');

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={isActive}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      className={buttonClasses}
      style={{ outlineColor: highlightColor }}
    >
      {/* Overlay */}
      <span className={overlayClasses} style={{ backgroundColor: overlayColor }} />

      {/* Content Grid */}
      <div className="relative grid h-full grid-rows-2 grid-cols-2 items-center gap-x-1 sm:gap-x-2">
        {/* Row 1 - Labels */}
        {side === 'bid' ? (
          <>
            <span
              className="col-start-1 row-start-1 text-sm font-medium leading-tight font-[Alexandria] text-left truncate"
              style={{ color: highlightColor }}
            >
              {labelText}
            </span>
            <div className="col-start-2 row-start-1 justify-self-end">
              <AmountLabel
                side={side}
                label={content?.amountLabel}
                symbol={content?.amountSymbol}
              />
            </div>
          </>
        ) : (
          <>
            <div className="col-start-1 row-start-1 justify-self-start">
              <AmountLabel
                side={side}
                label={content?.amountLabel}
                symbol={content?.amountSymbol}
              />
            </div>
            <span
              className="col-start-2 row-start-1 text-sm font-medium leading-tight font-[Alexandria] text-right truncate"
              style={{ color: highlightColor }}
            >
              {labelText}
            </span>
          </>
        )}

        {/* Row 2 - Values */}
        {side === 'bid' ? (
          <>
            <span
              className="col-start-1 row-start-2 text-xs font-normal leading-none font-[Alexandria] text-left truncate"
              style={{ color: priceColor }}
              title={priceValue}
            >
              {priceValue}
            </span>
            <span
              className="col-start-2 row-start-2 text-xs font-normal leading-none font-[Alexandria] text-right truncate"
              style={{ color: amountColor }}
              title={amountValue}
            >
              {amountValue}
            </span>
          </>
        ) : (
          <>
            <span
              className="col-start-1 row-start-2 text-xs font-normal leading-none font-[Alexandria] text-left truncate"
              style={{ color: amountColor }}
              title={amountValue}
            >
              {amountValue}
            </span>
            <span
              className="col-start-2 row-start-2 text-xs font-normal leading-none font-[Alexandria] text-right truncate"
              style={{ color: priceColor }}
              title={priceValue}
            >
              {priceValue}
            </span>
          </>
        )}
      </div>
    </button>
  );
}

// Main component
export default function OrderBookWidget({
  bid,
  ask,
  activeSide = null,
  disabled = false,
  onBidClick,
  onAskClick,
  className = '',
}: OrderBookWidgetProps) {
  const containerClasses = [
    'relative inline-flex h-[60px] w-full overflow-hidden rounded-xl bg-[#16171D]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <OrderBookSide
        side="bid"
        content={bid}
        disabled={disabled}
        isActive={activeSide === 'bid'}
        onClick={onBidClick}
      />

      <div className="my-1 h-12 w-px self-center" style={{ backgroundColor: COLORS.BORDER }} />

      <OrderBookSide
        side="ask"
        content={ask}
        disabled={disabled}
        isActive={activeSide === 'ask'}
        onClick={onAskClick}
      />
    </div>
  );
}
