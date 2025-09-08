'use client';
import React from 'react';
import { motion } from 'framer-motion';
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

/* ----------------------  เพิ่ม: ฟอร์แมตจำนวนให้รวมได้ 10 หลัก  ---------------------- */
const MAX_AMOUNT_DIGITS = 10;
function formatAmount10(value: number | string, maxDigits = MAX_AMOUNT_DIGITS) {
  const num = typeof value === 'string' ? Number(value.replace(/,/g, '')) : Number(value);
  if (!Number.isFinite(num)) return String(value);

  const negative = num < 0;
  const abs = Math.abs(num);
  const intStr = Math.floor(abs).toString(); // ส่วนจำนวนเต็ม (ไม่มีคอมมา)
  const intDigits = Math.max(1, intStr.length); // 0.x => อย่างน้อย 1 หลัก

  // ถ้าส่วนจำนวนเต็มยาวเกินหรือเท่ากับ maxDigits → ไม่แสดงทศนิยม
  if (intDigits >= maxDigits) {
    return (negative ? '-' : '') + intStr;
  }

  const fracDigits = maxDigits - intDigits; // จำนวนหลักทศนิยมที่เหลือให้ใช้
  const fixed = abs.toFixed(fracDigits); // เติมศูนย์ให้ครบ
  const [i, f] = fixed.split('.');
  const out = f && fracDigits > 0 ? `${i}.${f}` : i;
  return (negative ? '-' : '') + out;
}
/* -------------------------------------------------------------------------------------- */

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="w-36 h-11 inline-flex flex-col justify-center items-start rounded-xl">
      <div className="w-24 text-[10px] sm:text-xs leading-none" style={{ color: colors.gray600 }}>
        {label}
      </div>
      {/* เพิ่ม: + nowrap เพื่อคุมความสูง/ความกว้างตัวเลข */}
      <div className="text-base leading-normal text-white whitespace-nowrap">{value}</div>
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
    className,
  } = props;

  const isGain = pnlAbs >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full rounded-xl outline outline-1 outline-offset-[-1px] p-4 bg-transparent overflow-hidden font-['Alexandria'] ${className ?? ''}`}
      style={{ outlineColor: colors.gray500 }}
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6">
        {/* Left: Ticker + amount */}
        <div className="min-w-[260px] lg:pr-6 lg:border-r" style={{ borderColor: colors.gray600 }}>
          <div className="flex items-center gap-4">
            {/* Token icon */}
            <div className="w-10 h-10 relative">
              {icon ?? (
                <div
                  className="w-10 h-10 rounded-full grid place-items-center"
                  style={{ backgroundColor: colors.btc }}
                >
                  <span className="text-black font-semibold">₿</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              {/* จำกัดความกว้าง + ตัดปลายบรรทัดป้องกันดันเลย์เอาต์ */}
              <div className="text-white text-sm leading-tight max-w-[200px] truncate">
                {truncateCode(symbol)} ({name})
              </div>
              <div
                className="px-2 py-1 rounded-xl inline-flex items-center gap-2.5"
                style={{ backgroundColor: '#1E1E1E' }}
              >
                {/* เปลี่ยนเฉพาะบรรทัดนี้: ใช้ formatAmount10 + คุมไม่ให้ขึ้นบรรทัด */}
                <div className="text-base leading-normal text-white min-w-[120px] text-left whitespace-nowrap">
                  {formatAmount10(amount, 10)}
                </div>
                {/* unit ยาวเกิน 4 ก็ย่อลง */}
                <div className="text-base leading-normal text-white whitespace-nowrap">
                  {truncateCode(unit, 4)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: stats */}
        <div className="flex flex-wrap items-center gap-6">
          <Stat label="Current price" value={`$ ${fmtMoney(currentPrice)}`} />
          <Stat label="Average cost" value={`$ ${fmtMoney(averageCost)}`} />
          <Stat label="Value" value={`$ ${fmtMoney(value)}`} />
          <div className="w-48 h-11 inline-flex flex-col justify-center items-start">
            <div className="text-[10px] sm:text-xs leading-none" style={{ color: colors.gray600 }}>
              Unrealized PNL
            </div>
            {/* เพิ่ม: nowrap ป้องกันขึ้นบรรทัด */}
            <div
              className="w-44 text-base leading-normal flex items-center gap-1 whitespace-nowrap"
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
          className="ml-auto h-9 px-6 lg:px-9 rounded-lg flex items-center justify-center text-sm text-neutral-100 bg-blue-600 hover:brightness-110 active:brightness-95 transition"
        >
          Buy/Sell
        </button>
      </div>
    </motion.div>
  );
}

/* --- Demo wrapper (unchanged; ลบออกได้ในโปรดักชัน) --- */
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
