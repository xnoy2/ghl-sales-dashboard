export const CURRENCY = {
  symbol: "£",
  code: "GBP",
};

// ✅ FORMAT FUNCTION
export function formatCurrency(value: number) {
  return `${CURRENCY.symbol}${value.toLocaleString()}`;
}