'use client';
import React from 'react';
import Image from 'next/image';
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

// Coin icon components - Fixed at 40px always
const BTCIcon = () => (
  <Image
    src="/currency-icons/bitcoin-icon.svg"
    alt="Bitcoin"
    width={40}
    height={40}
    className="rounded-full w-10 h-10 object-cover"
  />
);

const ETHIcon = () => (
  <Image
    src="/currency-icons/ethereum-icon.svg"
    alt="Ethereum"
    width={40}
    height={40}
    className="rounded-full w-10 h-10 object-cover"
  />
);

const BNBIcon = () => (
  <Image
    src="/currency-icons/bnb-coin.svg"
    alt="BNB"
    width={40}
    height={40}
    className="rounded-full w-10 h-10 object-cover"
  />
);

const SOLIcon = () => (
  <Image
    src="/currency-icons/solana-icon.svg"
    alt="Solana"
    width={40}
    height={40}
    className="rounded-full w-10 h-10 object-cover"
  />
);

const XRPIcon = () => (
  <Image
    src="/currency-icons/xrp-coin.svg"
    alt="XRP"
    width={40}
    height={40}
    className="rounded-full w-10 h-10 object-cover"
  />
);

const ADAIcon = () => (
  <Image
    src="/currency-icons/ada-coin.svg"
    alt="Cardano"
    width={40}
    height={40}
    className="rounded-full w-10 h-10 object-cover"
  />
);

const DOGEIcon = () => (
  <Image
    src="/currency-icons/doge-coin.svg"
    alt="Dogecoin"
    width={40}
    height={40}
    className="rounded-full w-10 h-10 object-cover"
  />
);

const DefaultIcon = () => (
  <Image
    src="/currency-icons/default-coin.svg"
    alt="Default Coin"
    width={40}
    height={40}
    className="rounded-full w-10 h-10 object-cover"
  />
);

// Function to get coin icon based on symbol - Always returns 40px icons
const getCoinIcon = (symbol: string) => {
  const upperSymbol = symbol.toUpperCase();
  
  switch (upperSymbol) {
    case 'BTC':
    case 'BITCOIN':
      return <BTCIcon />;
    case 'ETH':
    case 'ETHEREUM':
      return <ETHIcon />;
    case 'BNB':
      return <BNBIcon />;
    case 'SOL':
    case 'SOLANA':
      return <SOLIcon />;
    case 'XRP':
      return <XRPIcon />;
    case 'ADA':
    case 'CARDANO':
      return <ADAIcon />;
    case 'DOGE':
    case 'DOGECOIN':
      return <DOGEIcon />;
    default:
      return <DefaultIcon />;
  }
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
    <div className="w-[144px] shrink-0 inline-flex flex-col justify-center items-start rounded-xl gap-1">
      <div className="w-24 text-[12px] sm:text-xs leading-none" style={{ color: colors.gray600 }}>
        {label}
      </div>
      <div className="text-[16px] leading-normal text-white whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-2">
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

  // Use provided icon or get coin icon based on symbol (always 40px)
  const displayIcon = icon || getCoinIcon(symbol);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[1248px] h-[80px] pl-4 pr-4 py-3 border border-[#666] rounded-[12px] flex items-center"
      style={{ outlineColor: colors.gray500 }}
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-12 w-full">
        {/* Left: Ticker + amount (fixed width so all rows align) */}
        <div
          className="w-[252px] flex-none pr-[16px] lg:border-r border-[#828282]"
        >
          <div className="flex items-center gap-4">
            {/* Token icon - Fixed at 40px (w-10 h-10) */}
            <div className="w-10 h-10 relative flex items-center justify-center shrink-0">
              {displayIcon}
            </div>

            <div className="flex flex-col gap-1">
              <div
                className="text-white text-sm leading-tight max-w-[240px] truncate"
                title={`${symbol} (${name})`}
              >
                {symbol} ({name})
              </div>
              <div
                className="px-2 py-1 rounded-xl inline-flex items-center gap-2.5 bg-[#1F2029]"
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
          <div className="shrink-0 h-11 inline-flex flex-col justify-center items-start gap-1">
            <div className="text-[12px] sm:text-xs leading-none" style={{ color: colors.gray600 }}>
              Unrealized PNL
            </div>

             <div
              className="w-full text-[16px] leading-normal flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis"
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
        
        {/* Right: CTA with 16px margin from right edge */}
          <button
            onClick={onBuySell}
            className="w-[128px] h-[32px] px-6 rounded-lg flex items-center justify-center text-sm text-neutral-100 bg-blue-600 hover:brightness-110 active:brightness-95 transition"
          >
            Buy/Sell
          </button>
      </div>
    </motion.div>
  );
}