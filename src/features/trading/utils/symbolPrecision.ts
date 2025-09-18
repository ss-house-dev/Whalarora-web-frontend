import { useQuery, type UseQueryResult } from '@tanstack/react-query';

const BINANCE_EXCHANGE_INFO_URL = 'https://api.binance.com/api/v3/exchangeInfo';
const DEFAULT_PRICE_PRECISION = 2;
const DEFAULT_QUANTITY_PRECISION = 6;

interface BinanceFilter {
  filterType: string;
  tickSize?: string;
  stepSize?: string;
}

interface BinanceSymbol {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  isSpotTradingAllowed?: boolean;
  filters: BinanceFilter[];
}

interface BinanceExchangeInfoResponse {
  symbols: BinanceSymbol[];
}

export interface SymbolPrecision {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  tickSize?: string;
  stepSize?: string;
  pricePrecision: number;
  quantityPrecision: number;
}

export type SymbolPrecisionMap = Record<string, SymbolPrecision>;

export function decimalsFromSize(size?: string | null): number | undefined {
  if (!size) return undefined;
  const trimmed = size.trim();
  if (!trimmed) return undefined;

  const lower = trimmed.toLowerCase();

  if (lower.includes('e')) {
    const [mantissaRaw, exponentRaw] = lower.split('e');
    if (!mantissaRaw) return undefined;
    const exponent = Number(exponentRaw);
    if (!Number.isFinite(exponent)) return undefined;
    const mantissaDecimals = decimalsFromSize(mantissaRaw);
    const decimals = (mantissaDecimals ?? 0) - exponent;
    return decimals > 0 ? decimals : 0;
  }

  if (!trimmed.includes('.')) return 0;

  const fractionPart = trimmed.split('.')[1] ?? '';
  const trimmedFraction = fractionPart.replace(/0+$/, '');
  return trimmedFraction.length;
}

export function normalizeSymbolKey(symbol: string): string {
  return symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function makePairKey(base: string, quote = 'USDT'): string {
  return normalizeSymbolKey(`${base}${quote}`);
}

function parseSymbolPrecisions(data: BinanceExchangeInfoResponse): SymbolPrecisionMap {
  const map: SymbolPrecisionMap = {};

  for (const s of data.symbols) {
    if (!s || !s.symbol) continue;
    if (s.status !== 'TRADING') continue;
    if (s.isSpotTradingAllowed === false) continue;
    if (s.quoteAsset !== 'USDT' && !s.symbol.includes('USDT')) continue;

    const priceFilter = s.filters.find((f) => f.filterType === 'PRICE_FILTER');
    const lotSizeFilter = s.filters.find((f) => f.filterType === 'LOT_SIZE');
    const tickSize = priceFilter?.tickSize;
    const stepSize = lotSizeFilter?.stepSize;
    const pricePrecision = decimalsFromSize(tickSize) ?? DEFAULT_PRICE_PRECISION;
    const quantityPrecision = decimalsFromSize(stepSize) ?? DEFAULT_QUANTITY_PRECISION;

    const entry: SymbolPrecision = {
      symbol: s.symbol,
      baseAsset: s.baseAsset,
      quoteAsset: s.quoteAsset,
      tickSize,
      stepSize,
      pricePrecision,
      quantityPrecision,
    };

    const key = normalizeSymbolKey(s.symbol);
    map[key] = entry;

    const baseQuoteKey = makePairKey(s.baseAsset, s.quoteAsset);
    map[baseQuoteKey] = entry;
  }

  return map;
}

export async function fetchSymbolPrecisionMap(): Promise<SymbolPrecisionMap> {
  const response = await fetch(BINANCE_EXCHANGE_INFO_URL);
  if (!response.ok) {
    throw new Error(`Unable to load Binance exchange info (${response.status})`);
  }
  const data: BinanceExchangeInfoResponse = await response.json();
  return parseSymbolPrecisions(data);
}

export function getSymbolPrecision(
  map: SymbolPrecisionMap | undefined,
  base?: string,
  quote = 'USDT'
): SymbolPrecision | undefined {
  if (!map || !base) return undefined;
  const key = makePairKey(base, quote);
  if (map[key]) return map[key];
  if (map[normalizeSymbolKey(base)]) return map[normalizeSymbolKey(base)];
  const slashKey = normalizeSymbolKey(`${base}/${quote}`);
  return map[slashKey];
}

export interface UseSymbolPrecisionsOptions {
  enabled?: boolean;
}

export function useSymbolPrecisions(
  options: UseSymbolPrecisionsOptions = {}
): UseQueryResult<SymbolPrecisionMap, Error> {
  return useQuery<SymbolPrecisionMap, Error>({
    queryKey: ['binance-symbol-precisions'],
    queryFn: fetchSymbolPrecisionMap,
    enabled: options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

function parseNumeric(input: number | string | null | undefined): number | undefined {
  if (input === null || input === undefined) return undefined;
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : undefined;
  }

  const cleaned = input.replace(/,/g, '').trim();
  if (!cleaned) return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatNumberWithDecimals(
  value: number | string | null | undefined,
  decimals: number,
  locale = 'en-US'
): string {
  const numeric = parseNumeric(value);
  if (numeric === undefined) {
    if (typeof value === 'number') return '';
    return value ? String(value) : '';
  }
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numeric);
}

export interface FormatOptions {
  locale?: string;
  fallbackDecimals?: number;
}

export function formatPriceWithTick(
  value: number | string | null | undefined,
  precision?: SymbolPrecision | null,
  options: FormatOptions = {}
): string {
  const decimals =
    precision?.pricePrecision ??
    (precision?.tickSize ? decimalsFromSize(precision.tickSize) : undefined) ??
    options.fallbackDecimals ??
    DEFAULT_PRICE_PRECISION;
  const locale = options.locale ?? 'en-US';
  return formatNumberWithDecimals(value, decimals, locale);
}

export function formatAmountWithStep(
  value: number | string | null | undefined,
  precision?: SymbolPrecision | null,
  options: FormatOptions = {}
): string {
  const decimals =
    precision?.quantityPrecision ??
    (precision?.stepSize ? decimalsFromSize(precision.stepSize) : undefined) ??
    options.fallbackDecimals ??
    DEFAULT_QUANTITY_PRECISION;
  const locale = options.locale ?? 'en-US';
  return formatNumberWithDecimals(value, decimals, locale);
}
