'use client';

import { Trash2 } from 'lucide-react';
import ProgressBar from './ProgressBar';
import {
  useSymbolPrecisions,
  getSymbolPrecision,
  formatPriceWithTick,
  formatAmountWithStep,
} from '@/features/trading/utils/symbolPrecision';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog-close-order';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDateParts } from '@/features/trading/utils/dateFormat';

const FALLBACK_AMOUNT_PRECISION = 6;
const MAX_AMOUNT_DIGITS = 10;

type MobileOrderStatus = 'complete' | 'partial' | 'pending' | 'closed';

const ORDER_STATUS_META: Record<
  MobileOrderStatus,
  { label: string; dotColor: string; textColor: string }
> = {
  complete: { label: 'Complete', dotColor: '#4ED7B0', textColor: '#4ED7B0' },
  partial: { label: 'Partially Filled', dotColor: '#FFD477', textColor: '#FFD477' },
  pending: { label: 'Pending', dotColor: '#215EEC', textColor: '#6F8BFF' },
  closed: { label: 'Closed', dotColor: '#474747', textColor: '#A4A4A4' },
};

const ORDER_SIDE_META: Record<'buy' | 'sell', { label: string; badgeColor: string }> = {
  buy: { label: 'Buy', badgeColor: '#217871' },
  sell: { label: 'Sell', badgeColor: '#D84C4C' },
};

const STATUS_TO_MOBILE: Record<'pending' | 'partial' | 'filled' | 'cancelled', MobileOrderStatus> =
  {
    pending: 'pending',
    partial: 'partial',
    filled: 'complete',
    cancelled: 'closed',
  };

const clampPercent = (value: number) => Math.min(Math.max(value, 0), 100);

function parsePairSymbol(input: string): { base: string; quote: string } {
  const value = input?.trim() ?? '';
  if (!value) {
    return { base: '', quote: 'USDT' };
  }

  const separators = ['/', '-', '_'];
  for (const separator of separators) {
    if (value.includes(separator)) {
      const [rawBase = '', rawQuote = 'USDT'] = value.split(separator);
      return { base: rawBase.toUpperCase(), quote: (rawQuote || 'USDT').toUpperCase() };
    }
  }

  const upper = value.toUpperCase();
  if (upper.endsWith('USDT')) {
    return { base: upper.slice(0, -4), quote: 'USDT' };
  }

  return { base: upper, quote: 'USDT' };
}

export interface Order {
  id: string;
  side: 'buy' | 'sell';
  pair: string;
  datetime: string;
  price: string;
  amount: string;
  status: 'pending' | 'partial' | 'filled' | 'cancelled';
  filledAmount?: string;
  filledPercent?: number;
  _id?: string;
  symbol?: string;
  createdAt?: string;
}

interface Props {
  order: Order;
  onDelete?: () => void;
}

export default function OrderCard({ order, onDelete }: Props) {
  const isMobile = useIsMobile();
  const isBuy = order.side === 'buy';
  const { data: precisionMap } = useSymbolPrecisions();

  const pairInfo = parsePairSymbol(order.pair);
  const baseCurrency = pairInfo.base || order.symbol?.toUpperCase() || '';
  const quoteCurrency = pairInfo.quote || 'USDT';
  const symbolPrecision = precisionMap
    ? getSymbolPrecision(precisionMap, baseCurrency || order.symbol, quoteCurrency)
    : undefined;
  const quantityPrecision = symbolPrecision?.quantityPrecision ?? FALLBACK_AMOUNT_PRECISION;

  const priceValue = formatPriceWithTick(order.price, symbolPrecision, {
    locale: 'en-US',
    fallbackDecimals: 2,
  });
  const priceWithCurrency = quoteCurrency ? `${priceValue} ${quoteCurrency}` : priceValue;

  const appendUnit = (value: string, includeUnit: boolean) => {
    if (!includeUnit) return value;
    return baseCurrency ? `${value} ${baseCurrency}` : value;
  };

  const formatBaseAmount = (raw: string | number | undefined, includeUnit = true): string => {
    if (raw === null || raw === undefined) {
      return appendUnit('0', includeUnit);
    }

    const numeric = typeof raw === 'string' ? Number(raw) : raw;
    if (!Number.isFinite(numeric)) {
      const fallbackValue = raw !== undefined ? String(raw) : '';
      return appendUnit(fallbackValue, includeUnit);
    }

    const baseFormatted = formatAmountWithStep(numeric, symbolPrecision, {
      locale: 'en-US',
      fallbackDecimals: FALLBACK_AMOUNT_PRECISION,
    });
    const sanitized = baseFormatted.replace(/,/g, '');
    const digitsWithoutSign = sanitized.startsWith('-') ? sanitized.slice(1) : sanitized;
    const digitsWithoutDot = digitsWithoutSign.replace('.', '');
    if (digitsWithoutDot.length <= MAX_AMOUNT_DIGITS) {
      return appendUnit(baseFormatted, includeUnit);
    }

    const abs = Math.abs(numeric);
    const intDigits = Math.max(1, Math.floor(abs).toString().length);
    let decimals = 0;
    if (intDigits < MAX_AMOUNT_DIGITS) {
      const available = MAX_AMOUNT_DIGITS - intDigits;
      decimals = Math.min(quantityPrecision, available);
    }
    const manualFormatted = abs.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    const withSign = numeric < 0 ? `-${manualFormatted}` : manualFormatted;
    return appendUnit(withSign, includeUnit);
  };

  const formatAmount = (amount: string | number): string => formatBaseAmount(amount);

  const formatFilledAmount = (amount?: string): string => formatBaseAmount(amount ?? '0');

  const formatCloseAmount = (value: string): string => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return value;

    const abs = Math.abs(numeric);
    const truncate2 = (input: number) => Math.trunc(input * 100) / 100;
    const formatScaled = (input: number, suffix: string) =>
      `${truncate2(input).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}${suffix}`;

    if (abs < 1_000) {
      return numeric.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    if (abs < 1_000_000) return formatScaled(numeric / 1_000, 'K');
    if (abs < 1_000_000_000) return formatScaled(numeric / 1_000_000, 'M');
    if (abs < 1_000_000_000_000) return formatScaled(numeric / 1_000_000_000, 'B');
    if (abs < 1_000_000_000_000_000) return formatScaled(numeric / 1_000_000_000_000, 'T');

    return numeric.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const ConfirmCloseDialog = ({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) => {
    const isMobileVariant = variant === 'mobile';
    const triggerClassName = isMobileVariant
      ? 'inline-flex size-8 items-center justify-center rounded-lg border border-[#474747] text-[#E9E9E9] transition hover:border-[#5F5F5F] hover:text-white'
      : 'w-8 h-8 rounded-lg border border-[#A4A4A4] flex items-center justify-center text-[#A4A4A4] hover:text-white hover:border-white transition';
    const contentClassName = `items-stretch gap-6 ${isMobileVariant ? 'max-w-[18rem] p-0' : 'sm:max-w-[420px]'}`;

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className={triggerClassName} aria-label="Cancel order">
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className={contentClassName}>
          <AlertDialogTitle className="sr-only">Close order</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Do you want to close this order ?
          </AlertDialogDescription>
          {isMobileVariant ? (
            <div className="w-72 p-4 bg-[#16171D] rounded-xl outline outline-1 outline-offset-[-1px] outline-[#474747] flex flex-col items-center gap-4">
              <div className="flex flex-col items-center gap-3 pb-3 border-b border-[#474747]/60 w-full">
                <div className="flex h-12 w-12 items-center justify-center text-[#C22727]">
                  <Trash2 size={60} strokeWidth={1.8} />
                </div>
                <p className="w-full text-center text-[#E9E9E9] text-sm font-normal font-[Alexandria] leading-normal">
                  Do you want to close this order ?
                </p>
              </div>
              <div className="w-full flex flex-col gap-3">
                <AlertDialogAction
                  onClick={() => onDelete?.()}
                  className="h-10 rounded-lg bg-[#C22727] hover:bg-[#D84C4C] text-neutral-100 text-sm font-normal font-[Alexandria] leading-tight transition"
                >
                  Confirm
                </AlertDialogAction>
                <AlertDialogCancel className="h-10 rounded-lg border border-[#A4A4A4] text-white text-sm font-normal font-[Alexandria] leading-tight transition hover:bg-[#1F2029]">
                  Keep Open
                </AlertDialogCancel>
              </div>
            </div>
          ) : (
            <>
              <div className="w-full pb-3 border-b border-[#A4A4A4]/10 flex items-center gap-2">
                <div className="w-7 h-7 flex items-center justify-center text-[#C22727]">
                  <Trash2 size={20} strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <div className="text-white text-base font-normal font-[Alexandria] leading-normal">
                    Close order
                  </div>
                  <div className="text-[#E9E9E9] text-sm font-normal font-[Alexandria] leading-tight">
                    Do you want to close this order ?
                  </div>
                </div>
              </div>
              <div className="w-full grid grid-cols-2 gap-y-4 gap-x-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`text-sm font-normal font-[Alexandria] leading-tight ${
                      isBuy ? 'text-[#2FACA2]' : 'text-[#C22727]'
                    }`}
                  >
                    {isBuy ? 'Buy' : 'Sell'}
                  </div>
                  <div className="text-[#E9E9E9] text-sm font-normal font-[Alexandria] leading-tight">
                    {formatCloseAmount(order.amount)}
                    {baseCurrency ? ` ${baseCurrency}` : ''}
                  </div>
                </div>

                <div className="flex items-center justify-start gap-1">
                  <div className="text-[#A4A4A4] text-sm font-normal font-[Alexandria] leading-tight">
                    at
                  </div>
                  <div className="text-[#A4A4A4] text-sm font-normal font-[Alexandria] leading-tight">
                    Price
                  </div>
                  <div className="text-[#E9E9E9] text-sm font-normal font-[Alexandria] leading-tight">
                    {priceValue}
                  </div>
                  <div className="text-[#E9E9E9] text-sm font-normal font-[Alexandria] leading-tight">
                    {quoteCurrency}
                  </div>
                </div>

                <div className="flex items-center justify-start">
                  <AlertDialogCancel className="w-32 h-8 rounded-lg border border-[#A4A4A4] flex items-center justify-center text-white text-sm font-normal font-[Alexandria] leading-tight hover:bg-gray-700 transition">
                    Keep Open
                  </AlertDialogCancel>
                </div>

                <div className="flex items-center justify-start">
                  <AlertDialogAction
                    onClick={() => onDelete?.()}
                    className="w-32 h-8 rounded-lg bg-[#C22727] hover:bg-[#D84C4C] flex items-center justify-center text-neutral-100 text-sm font-normal font-[Alexandria] leading-tight transition"
                  >
                    Confirm
                  </AlertDialogAction>
                </div>
              </div>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    );
  };
  if (isMobile) {
    const mobileStatus = STATUS_TO_MOBILE[order.status] ?? 'pending';
    const statusMeta = ORDER_STATUS_META[mobileStatus];
    const sideMeta = ORDER_SIDE_META[order.side];
    const { date: formattedDate, time: formattedTime } = formatDateParts(
      order.createdAt ?? order.datetime,
      { includeSeconds: true }
    );
    const hasDateInfo = Boolean(formattedDate || formattedTime);
    const rawPercent = typeof order.filledPercent === 'number' ? order.filledPercent : 0;
    const filledPercent = clampPercent(rawPercent);
    const showProgress = mobileStatus === 'partial' && rawPercent !== undefined;
    const filledAmountValue = formatBaseAmount(order.filledAmount ?? '0', false);
    const quantityValue = formatBaseAmount(order.amount, false);

    return (
      <article className="flex w-full flex-col gap-3 rounded-xl border border-[#474747] bg-[#16171D] p-4">
        <header className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex size-2 rounded-full"
              style={{ backgroundColor: statusMeta.dotColor }}
            />
            <span className="font-normal leading-none" style={{ color: statusMeta.textColor }}>
              {statusMeta.label}
            </span>
          </div>
          {onDelete ? <ConfirmCloseDialog variant="mobile" /> : null}
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex h-7 min-w-[3.5rem] items-center justify-center rounded-lg px-3 text-xs font-normal leading-none text-white"
              style={{ backgroundColor: sideMeta.badgeColor }}
            >
              {sideMeta.label}
            </span>
            <span className="text-sm font-medium leading-tight text-white">{order.pair}</span>
          </div>
          {hasDateInfo && (
            <div className="flex items-center gap-2 whitespace-nowrap text-xs text-[#A4A4A4]">
              {formattedDate ? <span>{formattedDate}</span> : null}
              {formattedTime ? <span>{formattedTime}</span> : null}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 text-xs text-[#A4A4A4]">
          <div className="flex items-center justify-between gap-2">
            <span>Price</span>
            <div className="flex items-baseline gap-2 text-white">
              <span className="font-normal leading-none">{priceValue}</span>
              <span className="font-normal leading-none">{quoteCurrency}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span>Amount</span>
            <div className="flex items-baseline gap-2 text-white">
              <span className="font-normal leading-none">{quantityValue}</span>
              {baseCurrency ? (
                <span className="font-normal leading-none">{baseCurrency}</span>
              ) : null}
            </div>
          </div>
        </div>

        {showProgress && (
          <div className="flex flex-col gap-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#1F2029]">
              <div
                className="h-full rounded-full bg-[#215EEC]"
                style={{ width: `${filledPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#B7B7B7]">
              <span>
                Filled : {filledAmountValue}
                {baseCurrency ? ` ${baseCurrency}` : ''}
              </span>
              <span className="font-normal leading-none">{filledPercent.toFixed(2)} %</span>
            </div>
          </div>
        )}
      </article>
    );
  }

  const MetaLeft = () => (
    <div className="flex items-center gap-3 ">
      <div
        className={`w-12 h-7 px-2 rounded-lg inline-flex justify-center items-center 
        ${isBuy ? 'bg-[#217871]' : 'bg-[#D32F2F]'}`}
      >
        <span className="text-white text-xs font-normal leading-none ">
          {isBuy ? 'Buy' : 'Sell'}
        </span>
      </div>
      <span className="text-white text-sm font-medium mt-1 ml-5.5 mb-0.5">{order.pair}</span>
    </div>
  );

  const TopRight = () => (
    <div className="row-span-2 grid grid-cols-[1fr_auto] items-center gap-x-4">
      <div className="flex items-center gap-x-4 justify-end flex-wrap w-full min-w-0">
        <span className="text-slate-400 text-xs whitespace-nowrap">{order.datetime}</span>
        <div className="flex items-center justify-between w-[213px] gap-2 bg-[#1F2029] px-3 py-1 rounded-md whitespace-nowrap">
          <span className="text-slate-400 text-xs">Price</span>
          <span className="text-[12px] font-medium text-white">{priceWithCurrency}</span>
        </div>
        <div className="flex items-center w-[213px] justify-between gap-2 bg-[#1F2029] px-3 py-1 rounded-md whitespace-nowrap">
          <span className="text-slate-400 text-xs">Amount</span>
          <span className="text-[12px] font-medium text-white">{formatAmount(order.amount)}</span>
        </div>
      </div>
      {onDelete ? <ConfirmCloseDialog /> : <div />}
    </div>
  );

  return (
    <div className="w-full rounded-xl h-[100px] border border-[#666] bg-[#16171D] px-4 py-3 mb-3">
      <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-2 items-start">
        <MetaLeft />

        {order.status === 'partial' ? (
          <div className="row-span-2 grid grid-cols-[1fr_auto] items-center gap-x-4">
            <div className="flex items-center gap-4 justify-end flex-wrap w-full min-w-0">
              <span className="text-slate-400 text-xs whitespace-nowrap">{order.datetime}</span>
              <div className="flex items-center justify-between w-[213px] gap-12 bg-[#1F2029] px-3 py-1 rounded-md whitespace-nowrap">
                <span className="text-slate-400 text-xs">Price</span>
                <span className="text-[12px] font-medium text-white">{priceWithCurrency}</span>
              </div>
              <div className="flex items-center w-[213px] justify-between gap-12 bg-[#1F2029] px-3 py-1 rounded-md whitespace-nowrap">
                <span className="text-slate-400 text-xs">Amount</span>
                <span className="text-[12px] font-medium text-white">
                  {formatAmount(order.amount)}
                </span>
              </div>
            </div>

            {onDelete ? <ConfirmCloseDialog /> : <div />}

            <div className="col-start-1 mt-3 flex-1 ml-[16px]">
              <ProgressBar
                filledAmount={formatFilledAmount(order.filledAmount)}
                filledPercent={order.filledPercent ?? 0}
              />
            </div>
            <div />
          </div>
        ) : (
          <TopRight />
        )}

        {order.status === 'partial' && (
          <div className="flex items-center text-yellow-400 text-xs mt-1 ml-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2" />
            Partially Filled
          </div>
        )}

        {order.status !== 'partial' && (
          <div className="col-span-2 flex justify-center items-center gap-2 text-blue-400 text-xs mt-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 translate-y-[0px]" />
            <span className="leading-none">Pending</span>
          </div>
        )}
      </div>
    </div>
  );
}
