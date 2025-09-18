'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useSymbolPrecisions, getSymbolPrecision, formatPriceWithTick } from '@/features/trading/utils/symbolPrecision';
import type { SymbolPrecision } from '@/features/trading/utils/symbolPrecision';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Color palette from the brief (using Tailwind arbitrary values)
const colors = {
  surface: '#1F2029',
  success: '#4ED7B0',
  gray500: '#656565',
  gray600: '#828282',
  gray700: '#A4A4A4',
  btc: '#F7931A',
  white: '#FFFFFF',
};

export type AssetCardProps = {
  /** e.g. BTC */
  symbol: string;
  /** e.g. Bitcoin */
  name: string;
  /** e.g. 0.5 */
  amount: number | string;
  /** e.g. BTC */
  unit?: string;
  /** $ current price of 1 unit */
  currentPrice: number;
  /** $ average cost basis of 1 unit */
  averageCost: number;
  /** $ total position value */
  value: number;
  /** $ unrealized PnL absolute */
  pnlAbs: number;
  /** unrealized PnL percent (0.02 for +2%) */
  pnlPct: number;
  /** click handler for Buy/Sell */
  onBuySell?: () => void;
  /** optional icon svg/emoji/url */
  icon?: React.ReactNode;
  /** optional className passthrough */
  className?: string;
};

function fmtMoney(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function truncateCode(s: string, max = 4) {
  if (typeof s !== 'string') return String(s ?? '');
  return s.length <= max ? s : s.slice(0, max) + '...';
}

/* ----------------------  เธเธญเธฃเนเนเธกเธ•เธเธณเธเธงเธเนเธซเนเธฃเธงเธกเนเธ”เน 10 เธซเธฅเธฑเธ  ---------------------- */
const MAX_AMOUNT_DIGITS = 10;
type FormatAmountOptions = {
  precision?: SymbolPrecision | null;
  maxDigits?: number;
  locale?: string;
};

function formatAmount10(value: number | string, options: FormatAmountOptions = {}) {
  const { precision = null, maxDigits = MAX_AMOUNT_DIGITS, locale = 'en-US' } = options;
  const num = typeof value === 'string' ? Number(value.replace(/,/g, '')) : Number(value);
  if (!Number.isFinite(num)) return String(value ?? '');

  const negative = num < 0;
  const abs = Math.abs(num);
  const intDigits = Math.max(1, Math.floor(abs).toString().length);

  if (intDigits >= maxDigits) {
    const intPart = Math.floor(abs).toLocaleString(locale);
    return negative ? `-${intPart}` : intPart;
  }

  const availableDecimals = Math.max(0, maxDigits - intDigits);
  const precisionDecimals = precision?.quantityPrecision ?? availableDecimals;
  const decimals = Math.min(precisionDecimals, availableDecimals);

  const formatted = abs.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return negative ? `-${formatted}` : formatted;
}
/* -------------------------------------------------------------------------------------- */

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="w-36 shrink-0 h-11 inline-flex flex-col justify-center items-start rounded-xl gap-1">
      <div className="w-24 text-[10px] sm:text-xs leading-none" style={{ color: colors.gray600 }}>
        {label}
      </div>
      <div className="text-base leading-normal text-white whitespace-nowrap overflow-hidden text-ellipsis">
        {value}
      </div>
    </div>
  );
}

export function AssetCard(props: AssetCardProps) {
  const {
    symbol,
    name,
    amount,
    unit = symbol,
    currentPrice,
    averageCost,
    value,
    pnlAbs,
    pnlPct,
    onBuySell,
    icon,
  } = props;

  const { data: precisionMap } = useSymbolPrecisions();
  const symbolPrecision = React.useMemo(
    () => getSymbolPrecision(precisionMap, symbol, 'USDT'),
    [precisionMap, symbol]
  );

  const priceDisplay = React.useMemo(
    () => formatPriceWithTick(currentPrice, symbolPrecision, { locale: 'en-US', fallbackDecimals: 2 }),
    [currentPrice, symbolPrecision]
  );
  const averageCostDisplay = React.useMemo(
    () => formatPriceWithTick(averageCost, symbolPrecision, { locale: 'en-US', fallbackDecimals: 2 }),
    [averageCost, symbolPrecision]
  );
  const amountDisplay = React.useMemo(
    () => formatAmount10(amount, { precision: symbolPrecision, maxDigits: 10 }),
    [amount, symbolPrecision]
  );
  const isGain = pnlAbs >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full p-4 border-1 border-[#666] rounded-[12px]`}
      style={{ outlineColor: colors.gray500 }}
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-12">
        {/* Left: Ticker + amount (fixed width so all rows align) */}{' '}
        <div
          className="w-[280px] flex-none pr-4 lg:pr-6 lg:border-r"
          style={{ borderColor: colors.gray600 }}
        >
          <div className="flex items-center gap-4">
            {/* Token icon */}
            <div className="w-10 h-10 relative">
              {icon ?? (
                <div
                  className="w-10 h-10 rounded-full grid place-items-center"
                  style={{ backgroundColor: colors.btc }}
                >
                  <span className="text-black font-semibold">โฟ</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div
                className="text-white text-sm leading-tight max-w-[240px] truncate"
                title={`${symbol} (${name})`}
              >
                {symbol} ({name})
              </div>
              <div
                className="px-2 py-1 rounded-xl inline-flex items-center gap-2.5"
                style={{ backgroundColor: '#1E1E1E' }}
              >
                <div className="text-base leading-normal text-white min-w-[120px] text-left whitespace-nowrap">
                  {amountDisplay}
                </div>
                {/* unit เธขเธฒเธงเน€เธเธดเธ 4 เธขเนเธญเน€เธเนเธเธ•เธฑเธงเธ—เธตเน 5 เธเธฐเน€เธเนเธ... */}
                <div className="text-base leading-normal text-white whitespace-nowrap">
                  {truncateCode(unit, 4)}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Middle: stats */}
        <div className="flex flex-nowrap items-center gap-4 lg:gap-3 flex-1 min-w-0">
          <Stat label="Current price" value={`$ ${priceDisplay}`} />
          <Stat label="Average cost" value={`$ ${averageCostDisplay}`} />
          <Stat label="Value" value={`$ ${fmtMoney(value)}`} />
          <div className="w-56 shrink-0 h-11 inline-flex flex-col justify-center items-start gap-1">
            <div className="text-[10px] sm:text-xs leading-none" style={{ color: colors.gray600 }}>
              Unrealized PNL
            </div>

            <div
              className="w-full text-base leading-normal flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis"
              style={{ color: isGain ? colors.success : '#FF6B6B' }}
            >
              ${fmtMoney(Math.abs(pnlAbs))} ({isGain ? '+' : '-'}
              {(Math.abs(pnlPct) * 100).toFixed(2)}%)
              {isGain ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            </div>
          </div>
        </div>
        {/* Right: CTA */}
        <button
          onClick={onBuySell}
          className="ml-auto shrink-0 h-9 px-6 lg:px-9 rounded-lg flex items-center justify-center text-sm text-neutral-100 bg-blue-600 hover:brightness-110 active:brightness-95 transition"
        >
          Buy/Sell
        </button>
      </div>
    </motion.div>
  );
}

/* --- Demo wrapper (unchanged; เน€เธเธตเธขเธเน€เธเธทเนเธญเนเธงเน เธเนเธญเธขเธฅเธเธญเธญเธเธ•เธญเธเน€เธ—เธชเน€เธชเธฃเนเธ) --- */
export default function Demo() {
  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: colors.surface, color: colors.white }}
    >
      <div className="max-w-5xl mx-auto p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <AssetCard
            key={i}
            symbol="BTC"
            name="Bitcoin"
            amount={0.5}
            currentPrice={115200}
            averageCost={115200}
            value={14285.63}
            pnlAbs={14285.63}
            pnlPct={0.02}
            onBuySell={() => alert('Buy/Sell clicked')}
          />
        ))}
      </div>
    </div>
  );
}












