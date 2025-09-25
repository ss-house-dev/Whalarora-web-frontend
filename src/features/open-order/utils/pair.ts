export function parsePairSymbol(input: string): { base: string; quote: string } {
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
