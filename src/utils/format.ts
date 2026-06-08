/**
 * Formatting utilities used across the app. Centralized to avoid duplication.
 */

const CURRENCY_FORMATTERS = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency: string, locale: string): Intl.NumberFormat {
  const key = `${currency}:${locale}`;
  let fmt = CURRENCY_FORMATTERS.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    });
    CURRENCY_FORMATTERS.set(key, fmt);
  }
  return fmt;
}

export function formatCurrency(
  value: number | string,
  currency: string = 'USD',
  locale: string = 'es-CO',
): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num) || !Number.isFinite(num)) return '—';
  return getCurrencyFormatter(currency, locale).format(num);
}

const PERCENT_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPercentage(value: number, options?: { sign?: boolean }): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return '—';
  const formatted = PERCENT_FORMATTER.format(value);
  if (options?.sign && value > 0) return `+${formatted}`;
  return formatted;
}

const TIME_AGO_THRESHOLDS: Array<[number, Intl.RelativeTimeFormatUnit]> = [
  [60, 'second'],
  [3600, 'minute'],
  [86400, 'hour'],
  [86400 * 7, 'day'],
  [86400 * 30, 'week'],
  [86400 * 365, 'month'],
  [Infinity, 'year'],
];

const RTF = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

export function formatTimeAgo(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const diff = (d.getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  for (let i = 0; i < TIME_AGO_THRESHOLDS.length; i += 1) {
    const [limit, unit] = TIME_AGO_THRESHOLDS[i];
    if (abs < limit) {
      const divisor = i === 0 ? 1 : TIME_AGO_THRESHOLDS[i - 1][0];
      return RTF.format(Math.round(diff / divisor), unit);
    }
  }
  return d.toLocaleDateString('es-CO');
}

const DATE_FORMATTER = new Intl.DateTimeFormat('es-CO', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function formatDate(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return DATE_FORMATTER.format(d);
}

const DATETIME_FORMATTER = new Intl.DateTimeFormat('es-CO', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return DATETIME_FORMATTER.format(d);
}

export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}
