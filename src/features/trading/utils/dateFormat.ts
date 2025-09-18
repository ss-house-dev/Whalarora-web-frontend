const MONTH_ABBREVIATIONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

type DateInput = string | number | Date | null | undefined;

interface MonthIndexMap {
  [key: string]: number;
}

const MONTH_INDEX_BY_ABBR: MonthIndexMap = MONTH_ABBREVIATIONS.reduce((acc, abbr, index) => {
  acc[abbr.toUpperCase()] = index;
  return acc;
}, {} as MonthIndexMap);

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseDateInput(input: DateInput): Date | null {
  if (input === null || input === undefined) return null;

  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : new Date(input.getTime());
  }

  if (typeof input === "number") {
    const dateFromNumber = new Date(input);
    return Number.isNaN(dateFromNumber.getTime()) ? null : dateFromNumber;
  }

  if (typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) return null;

  const numericMatch = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (numericMatch) {
    const [, day, month, year, hours = "0", minutes = "0", seconds = "0"] = numericMatch;
    const dateFromNumeric = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds)
    );
    return Number.isNaN(dateFromNumeric.getTime()) ? null : dateFromNumeric;
  }

  const abbreviatedMatch = trimmed.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (abbreviatedMatch) {
    const [, day, rawMonth, year, hours = "0", minutes = "0", seconds = "0"] = abbreviatedMatch;
    const monthIndex = MONTH_INDEX_BY_ABBR[rawMonth.toUpperCase()];
    if (monthIndex !== undefined) {
      const dateFromAbbreviated = new Date(
        Number(year),
        monthIndex,
        Number(day),
        Number(hours),
        Number(minutes),
        Number(seconds)
      );
      return Number.isNaN(dateFromAbbreviated.getTime()) ? null : dateFromAbbreviated;
    }
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateWithMonthAbbrFromDate(date: Date) {
  const day = pad(date.getDate());
  const month = MONTH_ABBREVIATIONS[date.getMonth()];
  const year = date.getFullYear();
  return month ? `${day}-${month}-${year}` : "";
}

interface FormatTimeOptions {
  includeSeconds?: boolean;
}

function formatTimeFromDate(date: Date, options?: FormatTimeOptions) {
  const includeSeconds = options?.includeSeconds ?? true;
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return includeSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
}

export function formatDateWithMonthAbbr(input: DateInput): string {
  const date = parseDateInput(input);
  if (!date) return "";
  return formatDateWithMonthAbbrFromDate(date);
}

export function formatDateTimeWithMonthAbbr(input: DateInput, options?: FormatTimeOptions): string {
  const date = parseDateInput(input);
  if (!date) return "";
  const datePart = formatDateWithMonthAbbrFromDate(date);
  const timePart = formatTimeFromDate(date, options);
  return timePart ? `${datePart} ${timePart}` : datePart;
}

export function formatDateParts(input: DateInput, options?: FormatTimeOptions) {
  const date = parseDateInput(input);
  if (!date) {
    return { date: "", time: "" };
  }

  return {
    date: formatDateWithMonthAbbrFromDate(date),
    time: formatTimeFromDate(date, options),
  };
}
