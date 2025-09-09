'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useMarketPrice } from '@/features/trading/hooks/useMarketPrice'; // Import your existing hook

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
  /** $ current price of 1 unit - will be replaced by real-time price */
  currentPrice?: number;
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
  /** Enable real-time price updates (default: true) */
  enableRealTimePrice?: boolean;
};

function fmtMoney(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function truncateCode(s: string, max = 4) {
  if (typeof s !== 'string') return String(s ?? '');
  return s.length <= max ? s : s.slice(0, max) + '...';
}

/* ----------------------  ฟอร์แมตจำนวนให้รวมได้ 10 หลัก  ---------------------- */
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

function Stat({ label, value, isLoading = false }: { 
  label: string; 
  value: React.ReactNode; 
  isLoading?: boolean;
}) {
  return (
    <div className="w-36 shrink-0 inline-flex flex-col justify-center items-start rounded-xl gap-1">
      <div className="w-24 text-[10px] sm:text-xs leading-none" style={{ color: colors.gray600 }}>
        {label}
      </div>
      <div className="text-base leading-normal text-white whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-2">
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" style={{ color: colors.gray600 }} />
        ) : (
          value
        )}
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
    currentPrice = 0,
    averageCost,
    value,
    pnlAbs,
    pnlPct,
    onBuySell,
    icon,
    enableRealTimePrice = true,
  } = props;

  // Use real-time price if enabled
  const { marketPrice, isPriceLoading } = useMarketPrice(enableRealTimePrice ? symbol : '');
  
  // Determine which price to display
  const displayPrice = enableRealTimePrice && marketPrice 
    ? parseFloat(marketPrice.replace(/,/g, ''))
    : currentPrice;

  // Calculate real-time PnL if we have market price
  const realTimePnlAbs = enableRealTimePrice && marketPrice && typeof amount === 'number'
    ? (displayPrice - averageCost) * amount
    : pnlAbs;

  const realTimePnlPct = enableRealTimePrice && marketPrice && averageCost > 0
    ? (displayPrice - averageCost) / averageCost
    : pnlPct;

  const realTimeValue = enableRealTimePrice && marketPrice && typeof amount === 'number'
    ? displayPrice * amount
    : value;

  const isRealTimeGain = realTimePnlAbs >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[1248px] h-[80px] px-4 py-3 border border-[#666] rounded-[12px] flex items-center"
      style={{ outlineColor: colors.gray500 }}
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-12">
        {/* Left: Ticker + amount (fixed width so all rows align) */}
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
                  <span className="text-black font-semibold">₿</span>
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
                  {formatAmount10(amount, 10)}
                </div>
                {/* unit ยาวเกิน 4 ย่อเป็นตัวที่ 5 จะเป็น... */}
                <div className="text-base leading-normal text-white whitespace-nowrap">
                  {truncateCode(unit, 4)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Middle: stats */}
        <div className="flex flex-nowrap items-center gap-4 lg:gap-3 flex-1 min-w-0">
          <Stat 
            label="Current price" 
            value={`$ ${enableRealTimePrice && marketPrice ? marketPrice : fmtMoney(currentPrice)}`}
          />
          <Stat label="Average cost" value={`$ ${fmtMoney(averageCost)}`} />
          <Stat 
            label="Value" 
            value={`$ ${fmtMoney(realTimeValue)}`} 
           
          />
          <div className="w-56 shrink-0 inline-flex flex-col justify-center items-start gap-1">
            <div className="text-[10px] sm:text-xs leading-none" style={{ color: colors.gray600 }}>
              Unrealized PNL
            </div>

 <div
  className="w-full text-base leading-normal flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis"
  style={{ color: isRealTimeGain ? colors.success : '#FF6B6B' }}
>
  <>
    ${fmtMoney(Math.abs(realTimePnlAbs))} ({isRealTimeGain ? '+' : '-'}
    {(Math.abs(realTimePnlPct) * 100).toFixed(2)}%)
    {isRealTimeGain ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
  </>
</div>

          </div>
        </div>
        
        {/* Right: CTA */}
          <button
            onClick={onBuySell}
            className="w-[128px] h-[32px] px-6 mr-[16px] rounded-lg flex items-center justify-center text-sm text-neutral-100 bg-blue-600 hover:brightness-110 active:brightness-95 transition"
          >
            Buy/Sell
          </button>

      </div>
    </motion.div>
  );
}

/* --- Demo wrapper with real-time prices --- */
export default function Demo() {
  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: colors.surface, color: colors.white }}
    >
      <div className="max-w-5xl mx-auto p-4 space-y-3">
        <AssetCard
          symbol="BTC"
          name="Bitcoin"
          amount={0.5}
          currentPrice={50000} // fallback price
          averageCost={48000}
          value={25000}
          pnlAbs={1000}
          pnlPct={0.0416}
          onBuySell={() => alert('Buy/Sell BTC clicked')}
          enableRealTimePrice={true}
        />
        <AssetCard
          symbol="ETH"
          name="Ethereum"
          amount={2.5}
          currentPrice={3000} // fallback price
          averageCost={2800}
          value={7500}
          pnlAbs={500}
          pnlPct={0.0714}
          onBuySell={() => alert('Buy/Sell ETH clicked')}
          enableRealTimePrice={true}
        />
        <AssetCard
          symbol="ADA"
          name="Cardano"
          amount={1000}
          currentPrice={0.5} // fallback price
          averageCost={0.45}
          value={500}
          pnlAbs={50}
          pnlPct={0.111}
          onBuySell={() => alert('Buy/Sell ADA clicked')}
          enableRealTimePrice={true}
        />
        {/* Example with real-time disabled */}
        <AssetCard
          symbol="DOT"
          name="Polkadot"
          amount={100}
          currentPrice={8.5}
          averageCost={8.0}
          value={850}
          pnlAbs={50}
          pnlPct={0.0625}
          onBuySell={() => alert('Buy/Sell DOT clicked')}
          enableRealTimePrice={false} // Static price
        />
      </div>
    </div>
  );
}