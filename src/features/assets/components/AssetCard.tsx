'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useMarketPrice } from '@/features/trading/hooks/useMarketPrice';
import { useCoinContext } from '@/features/trading/contexts/CoinContext'; // เพิ่ม import
import { useSymbolPrecisions, getSymbolPrecision, formatPriceWithTick } from '@/features/trading/utils/symbolPrecision';
import type { SymbolPrecision } from '@/features/trading/utils/symbolPrecision';

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

// เธเธฑเธเธเนเธเธฑเธเธชเธฃเนเธฒเธ Coin object เธชเธณเธซเธฃเธฑเธ CoinContext
const createCoinObject = (symbol: string) => {
  const upperSymbol = symbol.toUpperCase();

  // Icon เธชเธณเธซเธฃเธฑเธเธเธเธฒเธ” 28px (เธซเธฅเธฑเธ)
  const getMainIcon = (sym: string) => {
    switch (sym) {
      case 'BTC':
        return (
          <Image
            src="/currency-icons/bitcoin-icon.svg"
            alt="Bitcoin"
            width={28}
            height={28}
            className="rounded-full"
          />
        );
      case 'ETH':
        return (
          <Image
            src="/currency-icons/ethereum-icon.svg"
            alt="Ethereum"
            width={28}
            height={28}
            className="rounded-full"
          />
        );
      case 'BNB':
        return (
          <Image
            src="/currency-icons/bnb-coin.svg"
            alt="BNB"
            width={28}
            height={28}
            className="rounded-full"
          />
        );
      case 'SOL':
        return (
          <Image
            src="/currency-icons/solana-icon.svg"
            alt="Solana"
            width={28}
            height={28}
            className="rounded-full"
          />
        );
      case 'XRP':
        return (
          <Image
            src="/currency-icons/xrp-coin.svg"
            alt="XRP"
            width={28}
            height={28}
            className="rounded-full"
          />
        );
      case 'ADA':
        return (
          <Image
            src="/currency-icons/ada-coin.svg"
            alt="Cardano"
            width={28}
            height={28}
            className="rounded-full"
          />
        );
      case 'DOGE':
        return (
          <Image
            src="/currency-icons/doge-coin.svg"
            alt="Dogecoin"
            width={28}
            height={28}
            className="rounded-full"
          />
        );
      default:
        return (
          <Image
            src="/currency-icons/default-coin.svg"
            alt="Default Coin"
            width={28}
            height={28}
            className="rounded-full"
          />
        );
    }
  };

  // Icon เธชเธณเธซเธฃเธฑเธเธเธเธฒเธ” 20px (popover)
  const getPopoverIcon = (sym: string) => {
    switch (sym) {
      case 'BTC':
        return (
          <Image
            src="/currency-icons/bitcoin-icon.svg"
            alt="Bitcoin"
            width={20}
            height={20}
            className="rounded-full"
          />
        );
      case 'ETH':
        return (
          <Image
            src="/currency-icons/ethereum-icon.svg"
            alt="Ethereum"
            width={20}
            height={20}
            className="rounded-full"
          />
        );
      case 'BNB':
        return (
          <Image
            src="/currency-icons/bnb-coin.svg"
            alt="BNB"
            width={20}
            height={20}
            className="rounded-full"
          />
        );
      case 'SOL':
        return (
          <Image
            src="/currency-icons/solana-icon.svg"
            alt="Solana"
            width={20}
            height={20}
            className="rounded-full"
          />
        );
      case 'XRP':
        return (
          <Image
            src="/currency-icons/xrp-coin.svg"
            alt="XRP"
            width={20}
            height={20}
            className="rounded-full"
          />
        );
      case 'ADA':
        return (
          <Image
            src="/currency-icons/ada-coin.svg"
            alt="Cardano"
            width={20}
            height={20}
            className="rounded-full"
          />
        );
      case 'DOGE':
        return (
          <Image
            src="/currency-icons/doge-coin.svg"
            alt="Dogecoin"
            width={20}
            height={20}
            className="rounded-full"
          />
        );
      default:
        return (
          <Image
            src="/currency-icons/default-coin.svg"
            alt="Default Coin"
            width={20}
            height={20}
            className="rounded-full"
          />
        );
    }
  };

  return {
    value: `BINANCE:${upperSymbol}USDT`,
    label: `${upperSymbol}/USDT`,
    icon: getMainIcon(upperSymbol),
    popoverIcon: getPopoverIcon(upperSymbol),
  };
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

function Stat({
  label,
  value,
  isLoading = false,
}: {
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
        {isLoading ? '0.00' : value}
      </div>
    </div>
  );
}

export function AssetCard(props: AssetCardProps) {
  const router = useRouter();
  const { setSelectedCoin } = useCoinContext(); // เน€เธเธดเนเธก hook เธเธตเน

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
    icon,
    enableRealTimePrice = true,
    onBuySell, // เน€เธเนเธ onBuySell prop เนเธงเนเน€เธเธทเนเธญเธกเธตเธเธฒเธฃเนเธเนเธเธฒเธเธเธดเน€เธจเธฉ
  } = props;

  const { data: precisionMap } = useSymbolPrecisions();
  const symbolPrecision = React.useMemo(
    () => getSymbolPrecision(precisionMap, symbol, 'USDT'),
    [precisionMap, symbol]
  );

  // Use real-time price if enabled
  const { marketPrice, isPriceLoading } = useMarketPrice(enableRealTimePrice ? symbol : '');

  // Determine which price to display
  const displayPrice =
    enableRealTimePrice && marketPrice ? parseFloat(marketPrice.replace(/,/g, '')) : currentPrice;

  const staticCurrentPriceDisplay = React.useMemo(
    () => formatPriceWithTick(currentPrice, symbolPrecision, { locale: 'en-US', fallbackDecimals: 2 }),
    [currentPrice, symbolPrecision]
  );
  const averageCostDisplay = React.useMemo(
    () => formatPriceWithTick(averageCost, symbolPrecision, { locale: 'en-US', fallbackDecimals: 2 }),
    [averageCost, symbolPrecision]
  );
  const formattedCurrentPrice =
    enableRealTimePrice && marketPrice ? marketPrice : staticCurrentPriceDisplay;
  const amountDisplay = React.useMemo(
    () => formatAmount10(amount, { precision: symbolPrecision, maxDigits: 10 }),
    [amount, symbolPrecision]
  );

  // Calculate real-time PnL if we have market price - เนเธ•เนเธ–เนเธฒ loading เนเธซเนเน€เธเนเธ 0
  const realTimePnlAbs = isPriceLoading
    ? 0 // เธ–เนเธฒ loading เนเธซเนเน€เธเนเธ 0
    : enableRealTimePrice && marketPrice && typeof amount === 'number'
      ? (displayPrice - averageCost) * amount
      : pnlAbs;

  const realTimePnlPct = isPriceLoading
    ? 0 // เธ–เนเธฒ loading เนเธซเนเน€เธเนเธ 0
    : enableRealTimePrice && marketPrice && averageCost > 0
      ? (displayPrice - averageCost) / averageCost
      : pnlPct;

  const realTimeValue =
    enableRealTimePrice && marketPrice && typeof amount === 'number'
      ? displayPrice * amount
      : value;

  const isRealTimeGain = realTimePnlAbs >= 0;

  // Use provided icon or get coin icon based on symbol (always 40px)
  const displayIcon = icon || getCoinIcon(symbol);

  const handleBuySell = () => {
    // เธ–เนเธฒเธกเธต onBuySell prop เนเธซเนเน€เธฃเธตเธขเธเนเธเนเธเนเธญเธ (เธชเธณเธซเธฃเธฑเธ custom logic)
    if (onBuySell) {
      onBuySell();
    }

    // เธชเธฃเนเธฒเธ Coin object เธชเธณเธซเธฃเธฑเธ CoinContext
    const coinObject = createCoinObject(symbol);
    try {
      // เธญเธฑเธเน€เธ”เธ• selected coin เนเธ CoinContext
      setSelectedCoin(coinObject);

      // เน€เธเธดเนเธก delay เน€เธฅเนเธเธเนเธญเธขเธเนเธญเธ navigate
      setTimeout(() => {
        router.push('/main/trading');
      }, 100);
    } catch {
      router.push('/main/trading');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[1248px] h-[80px] pl-4 pr-4 py-3 border border-[#666] rounded-[12px] flex items-center"
      style={{ outlineColor: colors.gray500 }}
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-12 w-full">
        {/* Left: Ticker + amount (fixed width so all rows align) */}
        <div className="w-[272px] flex-none pr-[16px] lg:border-r border-[#828282]">
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
              <div className="px-2 py-1 rounded-xl inline-flex items-center gap-2.5 bg-[#1F2029]">
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
          <Stat
            label="Current price"
            value={`$ ${formattedCurrentPrice}`}
            isLoading={isPriceLoading}
          />
          <Stat label="Average cost" value={`$ ${averageCostDisplay}`} />
          <Stat label="Value" value={`$ ${fmtMoney(realTimeValue)}`} />
          <div className="shrink-0 h-11 inline-flex flex-col justify-center items-start gap-1">
            <div className="text-[12px] sm:text-xs leading-none" style={{ color: colors.gray600 }}>
              Unrealized PNL
            </div>

            <div
              className="w-full text-[16px] leading-normal flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis"
              style={{
                color: isPriceLoading ? colors.white : isRealTimeGain ? colors.success : '#FF6B6B',
              }}
            >
              {isPriceLoading ? (
                <div className="flex items-center gap-2">
                  <span>$0.00 (0.00%)</span>
                </div>
              ) : (
                <>
                  ${fmtMoney(Math.abs(realTimePnlAbs))} ({isRealTimeGain ? '+' : '-'}
                  {(Math.abs(realTimePnlPct) * 100).toFixed(2)}%)
                  {isRealTimeGain ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: CTA with 16px margin from right edge */}
        <button
          onClick={handleBuySell}
          className="w-[128px] h-[32px] px-6 rounded-lg flex items-center justify-center text-sm text-neutral-100 bg-blue-600 hover:brightness-110 active:brightness-95 transition"
        >
          Buy/Sell
        </button>
      </div>
    </motion.div>
  );
}























