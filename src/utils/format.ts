export function formatCurrency(n: number): string {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
export function formatCurrencyPrecise(n: number): string {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}
export function clamp(n: number, min?: number, max?: number): number {
  if (typeof min === "number") n = Math.max(min, n);
  if (typeof max === "number") n = Math.min(max, n);
  return n;
}
