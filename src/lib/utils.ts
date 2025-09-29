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

const compactNumberFormatterCache = new Map<string, Intl.NumberFormat>();

function getCompactNumberFormatter({
  locale = 'en-US',
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
}: CompactNumberOptions = {}): Intl.NumberFormat {
  const key = `${locale}-${minimumFractionDigits}-${maximumFractionDigits}`;
  const cached = compactNumberFormatterCache.get(key);
  if (cached) return cached;

  const formatter = new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits,
    maximumFractionDigits,
  });

  compactNumberFormatterCache.set(key, formatter);
  return formatter;
}

export function formatCompactNumber(
  value: number | string | null | undefined,
  options?: CompactNumberOptions
): string | null {
  if (value === null || value === undefined) return null;

  const numeric = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numeric)) return null;

  const formatter = getCompactNumberFormatter(options);
  const formatted = formatter.format(numeric);

  // Normalize space-less suffix (e.g., ensure uppercase)
  return formatted.replace(/([a-zA-Z])$/, (match) => match.toUpperCase());
}
