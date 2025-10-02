import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CompactNumberOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_FRACTION_DIGITS = 2;
const MAX_FRACTION_DIGITS = 20;

const numberFormatterCache = new Map<string, Intl.NumberFormat>();

function normalizeFractionDigits(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return DEFAULT_FRACTION_DIGITS;
  }

  const truncated = Math.trunc(value);
  return Math.max(0, Math.min(MAX_FRACTION_DIGITS, truncated));
}

function getNumberFormatter(
  locale: string,
  minimumFractionDigits: number,
  maximumFractionDigits: number
): Intl.NumberFormat {
  const key = `${locale}-${minimumFractionDigits}-${maximumFractionDigits}`;
  const cached = numberFormatterCache.get(key);
  if (cached) return cached;

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping: false,
  });

  numberFormatterCache.set(key, formatter);
  return formatter;
}

function roundToFractionDigits(value: number, fractionDigits: number): number {
  if (!Number.isFinite(value)) return value;

  if (fractionDigits <= 0) {
    const rounded = Math.round(value);
    return Object.is(rounded, -0) ? 0 : rounded;
  }

  const factor = 10 ** fractionDigits;
  const rounded = Math.round((value + Number.EPSILON) * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function clampCompactValue(value: number, fractionDigits: number): number {
  const abs = Math.abs(value);
  if (abs < 1000) return value;

  const step = fractionDigits > 0 ? 10 ** -fractionDigits : 1;
  const limit = Number((1000 - step).toFixed(fractionDigits));
  const clamped = Math.min(abs, limit);
  const signed = (Math.sign(value) || 1) * clamped;
  return Object.is(signed, -0) ? 0 : signed;
}

type NormalizedCompactOptions = {
  locale: string;
  minimumFractionDigits: number;
  maximumFractionDigits: number;
};

function normalizeOptions(options?: CompactNumberOptions): NormalizedCompactOptions {
  const locale = options?.locale ?? DEFAULT_LOCALE;

  let min = options?.minimumFractionDigits;
  let max = options?.maximumFractionDigits;

  if (min === undefined && max === undefined) {
    min = DEFAULT_FRACTION_DIGITS;
    max = DEFAULT_FRACTION_DIGITS;
  } else {
    if (min === undefined) {
      min = max !== undefined ? Math.min(DEFAULT_FRACTION_DIGITS, max) : DEFAULT_FRACTION_DIGITS;
    }
    if (max === undefined) {
      max = Math.max(DEFAULT_FRACTION_DIGITS, min);
    }
  }

  const normalizedMin = normalizeFractionDigits(min);
  const normalizedMax = normalizeFractionDigits(max);
  const finalMax = Math.max(normalizedMin, normalizedMax);

  return {
    locale,
    minimumFractionDigits: normalizedMin,
    maximumFractionDigits: finalMax,
  };
}

const COMPACT_UNITS = [
  { threshold: 1_000_000_000_000, divisor: 1_000_000_000_000, suffix: 'T' },
  { threshold: 1_000_000_000, divisor: 1_000_000_000, suffix: 'B' },
  { threshold: 1_000_000, divisor: 1_000_000, suffix: 'M' },
  { threshold: 1_000, divisor: 1_000, suffix: 'K' },
] as const;

export function formatCompactNumber(
  value: number | string | null | undefined,
  options?: CompactNumberOptions
): string | null {
  if (value === null || value === undefined) return null;

  let numeric: number;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const sanitized = trimmed.replace(/,/g, '');
    numeric = Number(sanitized);
  } else {
    numeric = value;
  }

  if (!Number.isFinite(numeric)) return null;

  const { locale, minimumFractionDigits, maximumFractionDigits } = normalizeOptions(options);
  const formatter = getNumberFormatter(locale, minimumFractionDigits, maximumFractionDigits);
  const digitsForRounding = maximumFractionDigits;

  const formatValue = (input: number) => {
    const rounded = roundToFractionDigits(input, digitsForRounding);
    const clamped = clampCompactValue(rounded, digitsForRounding);
    return formatter.format(clamped);
  };

  const absValue = Math.abs(numeric);

  for (const { threshold, divisor, suffix } of COMPACT_UNITS) {
    if (absValue >= threshold) {
      const scaled = numeric / divisor;
      const formatted = formatValue(scaled);
      return `${formatted}${suffix}`;
    }
  }

  return formatValue(numeric);
}
