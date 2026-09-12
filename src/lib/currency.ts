/**
 * Formats a raw string of digits (as the user types, cents-last) into a
 * BRL-style display value: "1.000,00". Any non-digit characters in the
 * input are stripped before formatting, so this can run on every keystroke
 * of a plain text input without a masking library.
 */
export function formatCurrencyMask(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, "");
  const cents = Number(digits || "0");
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseCurrencyDisplay(display: string): number {
  const normalized = display.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

export function centsToCurrencyDisplay(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
