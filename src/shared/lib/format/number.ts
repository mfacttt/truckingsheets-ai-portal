export function formatMoney(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatMoneyCompact(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}k`
  return formatMoney(n)
}

export function formatRpm(n: number): string {
  return `$${n.toFixed(4)}`
}

export function formatMiles(n: number): string {
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 1 })} mi`
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

export function formatPct(n: number, digits = 1): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`
}

export function formatShare(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`
}
