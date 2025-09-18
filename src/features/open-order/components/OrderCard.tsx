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

const FALLBACK_AMOUNT_PRECISION = 6;
const MAX_AMOUNT_DIGITS = 10;

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

  const formatCloseAmount = (amount: string): string => {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric)) return amount;

    const abs = Math.abs(numeric);
    if (abs < 1000) {
      return formatBaseAmount(numeric, false);
    }

    const truncate2 = (value: number) => Math.trunc(value * 100) / 100;
    const formatScaled = (value: number, suffix: string) =>
      `${truncate2(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}${suffix}`;

    if (abs < 1_000_000) return formatScaled(numeric / 1_000, 'K');
    if (abs < 1_000_000_000) return formatScaled(numeric / 1_000_000, 'M');
    if (abs < 1_000_000_000_000) return formatScaled(numeric / 1_000_000_000, 'B');
    if (abs < 1_000_000_000_000_000) return formatScaled(numeric / 1_000_000_000_000, 'T');

    return truncate2(numeric).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const ConfirmCloseDialog = () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="w-8 h-8 rounded-lg border border-[#A4A4A4] flex items-center justify-center text-[#A4A4A4] hover:text-white hover:border-white transition">
          <Trash2 size={16} />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[420px] bg-[#16171D] border border-[#2D2D2D] text-white">
        <AlertDialogTitle className="text-[18px] font-semibold text-white">
          Close Order
        </AlertDialogTitle>
        <AlertDialogDescription className="text-sm text-[#C0C0C0]">
          Are you sure you want to close this order? This action cannot be undone.
        </AlertDialogDescription>

        <div className="mt-6 space-y-4 text-sm">
          <div className="flex items-center justify-start gap-2">
            <div className="w-12 h-7 px-2 rounded-lg inline-flex justify-center items-center bg-[#D32F2F]">
              {isBuy ? 'Buy' : 'Sell'}
            </div>
            <div className="text-[#E9E9E9] text-sm font-normal leading-tight">
              {formatCloseAmount(order.amount)}
              {baseCurrency ? ` ${baseCurrency}` : ''}
            </div>
          </div>

          <div className="flex items-center justify-start gap-2">
            <div className="text-[#A4A4A4] text-sm font-normal leading-tight">at</div>
            <div className="text-[#A4A4A4] text-sm font-normal leading-tight">Price</div>
            <div className="text-[#E9E9E9] text-sm font-normal leading-tight">{priceValue}</div>
            <div className="text-[#E9E9E9] text-sm font-normal leading-tight">{quoteCurrency}</div>
          </div>

          <div className="flex items-center justify-start">
            <AlertDialogCancel className="w-32 h-8 rounded-lg border border-[#A4A4A4] flex items-center justify-center text-white text-sm leading-tight hover:bg-gray-700 transition">
              Keep Open
            </AlertDialogCancel>
          </div>

          <div className="flex items-center justify-start">
            <AlertDialogAction
              onClick={() => onDelete?.()}
              className="w-32 h-8 rounded-lg bg-[#C22727] hover:bg-[#D84C4C] flex items-center justify-center text-neutral-100 text-sm leading-tight transition"
            >
              Confirm
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );

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
              <div className="flex items-center justify-between w-[213px] gap-12 bg-[#1A1A1A] px-3 py-1 rounded-md whitespace-nowrap">
                <span className="text-slate-400 text-xs">Price</span>
                <span className="text-[12px] font-medium text-white">{priceWithCurrency}</span>
              </div>
              <div className="flex items-center w-[213px] justify-between gap-12 bg-[#1A1A1A] px-3 py-1 rounded-md whitespace-nowrap">
                <span className="text-slate-400 text-xs">Amount</span>
                <span className="text-[12px] font-medium text-white">
                  {formatAmount(order.amount)}
                </span>
              </div>
            </div>

            {onDelete ? <ConfirmCloseDialog /> : <div />}

            <div className="col-start-1 mt-3 flex-1 ml-[32px]">
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
