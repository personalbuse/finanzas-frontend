export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
}

export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${(value || 0).toFixed(2)}%`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

export function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} días`;
}

export function formatValue(value: number | null | undefined, currency: string): string {
  if (value === null || value === undefined) return '-';
  if (currency === 'JPY' || currency === 'KRW') {
    return new Intl.NumberFormat('ja-JP').format(Math.round(value));
  }
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function formatPrice(price: number, currency: string): string {
  const locales: Record<string, string> = {
    COP: 'es-CO', BRL: 'pt-BR', CLP: 'es-CL',
    JPY: 'ja-JP', CNY: 'zh-CN', GBP: 'en-GB', EUR: 'de-DE',
  };
  return new Intl.NumberFormat(locales[currency] || 'en-US', {
    style: 'currency', currency,
  }).format(price);
}
