export function formatParticipantNumber(n: number): string {
  return n.toString().padStart(3, '0');
}

export function formatDateTime(iso: string, locale = 'es'): string {
  const d = new Date(iso);
  return d.toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatCurrency(
  amountCents: number,
  currency = 'usd',
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
  }).format(amountCents / 100);
}
