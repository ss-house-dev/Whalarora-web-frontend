export function formatAmountAbbreviation(value: number): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }

  const absValue = Math.abs(value);

  // AC6: Amount in range 0 to 999
  if (absValue >= 0 && absValue < 1000) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // AC7: Amount in range 1,000 to 999,999
  if (absValue >= 1000 && absValue < 1_000_000) {
    const abbreviatedValue = Math.floor((value / 1000) * 100) / 100;
    return (
      abbreviatedValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + 'k'
    );
  }

  // AC8: Amount in range 1,000,000 to 999,999,999
  if (absValue >= 1_000_000 && absValue < 1_000_000_000) {
    const abbreviatedValue = Math.floor((value / 1_000_000) * 100) / 100;
    return (
      abbreviatedValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + 'M'
    );
  }

  // AC9: Amount in range 1,000,000,000 to 999,999,999,999
  if (absValue >= 1_000_000_000 && absValue < 1_000_000_000_000) {
    const abbreviatedValue = Math.floor((value / 1_000_000_000) * 100) / 100;
    return (
      abbreviatedValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + 'B'
    );
  }

  // AC10: Amount in range 1,000,000,000,000 to 999,999,999,999,999
  if (absValue >= 1_000_000_000_000 && absValue < 1_000_000_000_000_000) {
    const abbreviatedValue = Math.floor((value / 1_000_000_000_000) * 100) / 100;
    return (
      abbreviatedValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + 'T'
    );
  }

  // For values larger than 999.99T, or negative values outside the defined ranges,
  // we can fall back to a default formatting or throw an error if out of spec.
  // For now, let's just return the number with 2 decimal places.
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
