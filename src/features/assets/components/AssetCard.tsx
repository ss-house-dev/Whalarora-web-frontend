'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useHoldingDesktopBreakpoint } from '../hooks/useHoldingDesktopBreakpoint';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useMarketPrice } from '@/features/trading/hooks/useMarketPrice';
import { useCoinContext } from '@/features/trading/contexts/CoinContext';
import {
  useSymbolPrecisions,
  getSymbolPrecision,
  formatPriceWithTick,
} from '@/features/trading/utils/symbolPrecision';
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

// สร้าง Coin object จากข้อมูลเหรียญที่เลือกใน CoinContext
const createCoinObject = (symbol: string) => {
  const upperSymbol = symbol.toUpperCase();

  // Icon สำหรับแสดงใน AssetCard
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

  // Icon สำหรับแสดงใน Popover
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
  /** Force layout to desktop breakpoint when true */
  isDesktopLayout?: boolean;
};

function fmtMoney(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function truncateCode(s: string, max = 4) {
  if (typeof s !== 'string') return String(s ?? '');
  return s.length <= max ? s : s.slice(0, max) + '...';
}

/* ---  ฟังก์ชันสำหรับการจัดรูปแบบจำนวนเงิน --- */
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

export function AssetCard(props: AssetCardProps) {
  const router = useRouter();
  const { setSelectedCoin } = useCoinContext(); // ใช้ useCoinContext เพื่อดึงฟังก์ชัน setSelectedCoin

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
    className,
    enableRealTimePrice = true,
    onBuySell, // ใช้ onBuySell prop เพื่อเรียกใช้ฟังก์ชันที่กำหนดเอง
    isDesktopLayout: desktopLayoutOverride,
  } = props;

  const desktopLayoutMatch = useHoldingDesktopBreakpoint();
  const isDesktopLayout = desktopLayoutOverride ?? desktopLayoutMatch;
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
    () =>
      formatPriceWithTick(currentPrice, symbolPrecision, { locale: 'en-US', fallbackDecimals: 2 }),
    [currentPrice, symbolPrecision]
  );
  const averageCostDisplay = React.useMemo(
    () =>
      formatPriceWithTick(averageCost, symbolPrecision, { locale: 'en-US', fallbackDecimals: 2 }),
    [averageCost, symbolPrecision]
  );
  const formattedCurrentPrice =
    enableRealTimePrice && marketPrice ? marketPrice : staticCurrentPriceDisplay;
  const amountDisplay = React.useMemo(
    () => formatAmount10(amount, { precision: symbolPrecision, maxDigits: 10 }),
    [amount, symbolPrecision]
  );

  // Calculate real-time PnL if we have market price - หากกำลังโหลดอยู่ให้แสดง 0
  const realTimePnlAbs = isPriceLoading
    ? 0
    : enableRealTimePrice && marketPrice && typeof amount === 'number'
      ? (displayPrice - averageCost) * amount
      : pnlAbs;

  const realTimePnlPct = isPriceLoading
    ? 0 // หากกำลังโหลดอยู่ให้แสดง 0
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
    if (onBuySell) {
      onBuySell();
    }

    // Create Coin object from selected coin data
    const coinObject = createCoinObject(symbol);
    try {
      // Set selected coin in CoinContext
      setSelectedCoin(coinObject);

      // Add delay before navigating
      setTimeout(() => {
        router.push('/main/trading');
      }, 100);
    } catch {
      router.push('/main/trading');
    }
  };

  const compactPnlText = isPriceLoading
    ? '0.00 (+0.00%)'
    : `${isRealTimeGain ? '' : '-'}${fmtMoney(Math.abs(realTimePnlAbs))} (${isRealTimeGain ? '+' : '-'}${(
        Math.abs(realTimePnlPct) * 100
      ).toFixed(2)}%)`;

  const currentPriceText = isPriceLoading ? '0.00' : formattedCurrentPrice;
  const averageCostText = averageCostDisplay;
  const valueText = fmtMoney(realTimeValue);
  const pnlDisplayText = isPriceLoading
    ? '0.00 (+0.00%)'
    : `${isRealTimeGain ? '' : '-'}${fmtMoney(Math.abs(realTimePnlAbs))} (${isRealTimeGain ? '+' : '-'}${(
        Math.abs(realTimePnlPct) * 100
      ).toFixed(2)}%)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'w-full rounded-xl border border-[#3A3B44] bg-[#16171D] ml-0.5 shadow-sm outline-[#3A3B44]',
        isDesktopLayout
          ? 'grid grid-cols-[288px_128px_128px_144px_144px_1fr] items-center gap-10 px-4 py-4'
          : 'flex flex-col gap-3 p-3',
        className
      )}
      style={{ outlineColor: colors.gray500 }}
    >
      {isDesktopLayout ? (
        <>
          <div className="flex h-full items-center gap-4 border-r border-[#2D3039] pr-8">
            <div className="flex h-10 w-10 items-center justify-center">{displayIcon}</div>

            <div className="flex flex-col gap-1">
              <span
                className="text-left text-sm font-normal leading-tight text-white"
                title={`${symbol} (${name})`}
              >
                {symbol} ({name})
              </span>
              <span className="inline-flex items-center gap-2.5 rounded-xl bg-[#1F2029] px-2 py-1">
                <span className="min-w-[120px] text-left text-base leading-normal text-white">
                  {amountDisplay}
                </span>
                <span className="text-base leading-normal text-white">
                  {truncateCode(unit, 4).toUpperCase()}
                </span>
              </span>
            </div>
          </div>

          <div className="justify-self-center text-center text-base leading-normal text-white">
            {currentPriceText}
          </div>
          <div className="justify-self-center text-center text-base leading-normal text-white">
            {averageCostText}
          </div>
          <div className="justify-self-center text-center text-base leading-normal text-white">
            {valueText}
          </div>
          <div
            className="justify-self-center whitespace-nowrap text-center text-base leading-normal"
            style={{
              color: isPriceLoading ? colors.white : isRealTimeGain ? colors.success : '#FF6B6B',
            }}
          >
            {pnlDisplayText}
          </div>
          <div className="justify-self-end">
            <button
              onClick={handleBuySell}
              className="flex h-8 w-[144px] items-center justify-center rounded-lg bg-[#215EEC] text-sm font-medium text-neutral-100 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#215EEC]/60 focus:ring-offset-0 active:brightness-95"
            >
              Buy/Sell
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center">{displayIcon}</div>
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-1 text-sm">
                <span className="text-white">{symbol}</span>
                <span className="text-[#A4A4A4]">{name}</span>
              </div>
              <div className="flex w-full items-center justify-between rounded-lg bg-[#16171D] px-2 py-1 text-sm">
                <span className="text-white">{amountDisplay}</span>
                <span className="text-right text-[#A4A4A4]">
                  {truncateCode(unit, 4).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(148px,1fr))] gap-3 sm:gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[#A4A4A4]">Average cost (USDT)</span>
                <span className="text-sm text-white">{averageCostDisplay}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-[#A4A4A4]">Value</span>
                <span className="text-sm text-white">{fmtMoney(realTimeValue)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 sm:gap-2">
              <span className="text-xs text-[#A4A4A4]">Unrealized PnL</span>
              <span
                className="inline-flex items-center gap-1 text-sm whitespace-nowrap"
                style={{
                  color: isPriceLoading
                    ? colors.white
                    : isRealTimeGain
                      ? colors.success
                      : '#FF6B6B',
                }}
              >
                {compactPnlText}
                {!isPriceLoading &&
                  (isRealTimeGain ? (
                    <ArrowUpRight size={16} className="text-[#4ED7B0]" />
                  ) : (
                    <ArrowDownRight size={16} className="text-[#FF6B6B]" />
                  ))}
              </span>
            </div>
          </div>

          <div className="mt-auto">
            <button
              type="button"
              onClick={handleBuySell}
              className="flex h-8 w-full items-center justify-center rounded-lg bg-[#215EEC] text-sm font-medium text-neutral-100 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#215EEC]/60 focus:ring-offset-0 active:brightness-95"
            >
              Buy/Sell
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
