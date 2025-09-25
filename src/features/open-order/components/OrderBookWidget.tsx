// src/features/open-order/components/OrderBookWidget.tsx
import React from 'react';
import clsx from 'clsx';

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

const PLACEHOLDER = '--';
const BID_COLOR = '#2FACA2';
const ASK_COLOR = '#D84C4C';
const LABEL_COLOR = '#7E7E7E';
const AMOUNT_COLOR = '#FFFFFF';
const BORDER_COLOR = '#474747';
const BID_OVERLAY = 'rgba(255, 255, 255, 0.08)';
const ASK_OVERLAY = 'rgba(255, 255, 255, 0.08)';
const BID_ACTIVE_OVERLAY = 'rgba(255, 255, 255, 0.16)';
const ASK_ACTIVE_OVERLAY = 'rgba(255, 255, 255, 0.16)';

function hasValue(value?: string | null) {
  if (value === null || value === undefined) return false;
  return value.trim().length > 0;
}

// AC6-AC10: format amount to 2 decimal places with K/M/B/T abbreviations
function formatAmount(value?: string | null): string {
  if (value === undefined || value === null) return PLACEHOLDER;
  const sanitized = String(value).replace(/,/g, '').trim();
  if (sanitized.length === 0) return PLACEHOLDER;

  const n = Number(sanitized);
  if (!isFinite(n)) return String(value);

  const formatTwoDecimals = (v: number) =>
    v.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const formatTruncated = (v: number) => formatTwoDecimals(Math.trunc(v * 100) / 100);

  const abs = Math.abs(n);

  if (abs < 1_000) return formatTruncated(n); // AC6
  if (abs < 1_000_000) return `${formatTruncated(n / 1_000)}k`; // AC7
  if (abs < 1_000_000_000) return `${formatTruncated(n / 1_000_000)}M`; // AC8
  if (abs < 1_000_000_000_000) return `${formatTruncated(n / 1_000_000_000)}B`; // AC9
  if (abs < 1_000_000_000_000_000) return `${formatTruncated(n / 1_000_000_000_000)}T`; // AC10
  return formatTwoDecimals(n);
}

/** Render amount label with optional long-symbol wrap. */
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

  const content = isLongAmountSymbol ? (
    <>
      <span>{compactAmountLabel}</span>
      <span>({amountSymbol})</span>
    </>
  ) : (
    rawAmountLabel
  );

  return (
    <span
      className={clsx(
        isLongAmountSymbol ? 'inline-flex flex-col gap-[2px] mb-2.5' : 'whitespace-nowrap',
        'text-[11px] font-normal leading-none font-[Alexandria]',
        side === 'bid' ? 'text-right' : 'text-left'
      )}
      style={{ color: LABEL_COLOR }}
    >
      {content}
    </span>
  );
}

type SideProps = {
  side: Side;
  content: SideContent | undefined;
  isActive: boolean;
  disabled: boolean;
  onClick?: () => void;
};

function OrderBookWidgetSide({ side, content, isActive, disabled, onClick }: SideProps) {
  const [isPressing, setIsPressing] = React.useState(false);

  const startPress = React.useCallback(() => {
    if (!disabled) {
      setIsPressing(true);
    }
  }, [disabled]);

  const endPress = React.useCallback(() => {
    setIsPressing(false);
  }, []);

  React.useEffect(() => {
    if (disabled) {
      setIsPressing(false);
    }
  }, [disabled]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled || event.repeat) return;

      if (
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'Space' ||
        event.key === 'Spacebar'
      ) {
        setIsPressing(true);
      }
    },
    [disabled]
  );

  const handleKeyUp = React.useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (
      event.key === 'Enter' ||
      event.key === ' ' ||
      event.key === 'Space' ||
      event.key === 'Spacebar'
    ) {
      setIsPressing(false);
    }
  }, []);

  const labelText = content?.label ?? (side === 'bid' ? 'Bid' : 'Ask');
  const priceValue =
    !disabled && hasValue(content?.price) ? (content?.price as string) : PLACEHOLDER;
  const rawAmount =
    !disabled && hasValue(content?.amount) ? (content?.amount as string) : PLACEHOLDER;
  const amountValue = rawAmount === PLACEHOLDER ? PLACEHOLDER : formatAmount(rawAmount);

  const isPlaceholderPrice = priceValue === PLACEHOLDER;
  const isPlaceholderAmount = amountValue === PLACEHOLDER;

  const highlightColor = side === 'bid' ? BID_COLOR : ASK_COLOR;
  const priceColor = isPlaceholderPrice ? LABEL_COLOR : highlightColor;
  const amountColor = isPlaceholderAmount ? LABEL_COLOR : AMOUNT_COLOR;
  const overlayBaseColor = side === 'bid' ? BID_OVERLAY : ASK_OVERLAY;
  const overlayActiveColor = side === 'bid' ? BID_ACTIVE_OVERLAY : ASK_ACTIVE_OVERLAY;
  const overlayColor = isPressing ? overlayActiveColor : overlayBaseColor;
  const roundingClass = side === 'bid' ? 'rounded-l-xl' : 'rounded-r-xl';

  const overlayOpacity = disabled ? 0 : isActive || isPressing ? 1 : undefined;

  const overlayStateClass = disabled
    ? 'opacity-0'
    : isActive
      ? 'opacity-100'
      : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100';

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={isActive}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      onPointerCancel={endPress}
      onBlur={endPress}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      className={clsx(
        'group relative h-full min-w-[140px] flex-1 overflow-hidden px-3 py-1 transition',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
        roundingClass,
        disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
      )}
      style={{ outlineColor: highlightColor }}
    >
      {/* WHY: overlay kept for active/hover state */}
      <span
        className={clsx(
          'pointer-events-none absolute inset-0 transition-opacity',
          roundingClass,
          overlayStateClass
        )}
        style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
      />

      {/* === GRID: 2 rows x 2 cols to lock positions regardless of text length/wrap === */}
      <div className="relative grid h-full grid-rows-2 grid-cols-2 items-center">
        {/* Row 1 - labels */}
        {side === 'bid' ? (
          <>
            <span
              className="col-start-1 row-start-1 mt-0 whitespace-nowrap text-sm font-medium leading-tight font-[Alexandria] text-left"
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
              className="col-start-2 row-start-1 mt-0 whitespace-nowrap text-sm font-medium leading-tight font-[Alexandria] text-right"
              style={{ color: highlightColor }}
            >
              {labelText}
            </span>
          </>
        )}

        {/* Row 2 - values */}
        {side === 'bid' ? (
          <>
            <span
              className="col-start-1 row-start-2 whitespace-nowrap text-xs font-normal leading-none font-[Alexandria] text-left"
              style={{ color: priceColor }}
            >
              {priceValue}
            </span>
            <span
              className="col-start-2 row-start-2 whitespace-nowrap text-xs font-normal leading-none font-[Alexandria] text-right"
              style={{ color: amountColor }}
            >
              {amountValue}
            </span>
          </>
        ) : (
          <>
            <span
              className="col-start-1 row-start-2 whitespace-nowrap text-xs font-normal leading-none font-[Alexandria] text-left"
              style={{ color: amountColor }}
            >
              {amountValue}
            </span>
            <span
              className="col-start-2 row-start-2 whitespace-nowrap text-xs font-normal leading-none font-[Alexandria] text-right"
              style={{ color: priceColor }}
            >
              {priceValue}
            </span>
          </>
        )}
      </div>
    </button>
  );
}

export default function OrderBookWidget({
  bid,
  ask,
  activeSide = null,
  disabled = false,
  onBidClick,
  onAskClick,
  className,
}: OrderBookWidgetProps) {
  return (
    <div
      className={clsx(
        'relative inline-flex h-[60px] w-full max-w-[384px] overflow-hidden rounded-xl bg-[#16171D]',
        className
      )}
    >
      <OrderBookWidgetSide
        side="bid"
        content={bid}
        disabled={disabled}
        isActive={activeSide === 'bid'}
        onClick={onBidClick}
      />
      <div className="my-1 h-12 w-px self-center" style={{ backgroundColor: BORDER_COLOR }} />
      <OrderBookWidgetSide
        side="ask"
        content={ask}
        disabled={disabled}
        isActive={activeSide === 'ask'}
        onClick={onAskClick}
      />
    </div>
  );
}
