/** Iraqi Dinar: smallest denomination is 250 (no 1, 5, 10, 25 etc. in practice) */
export const IQD_STEP = 250;

export const IQD_AMOUNT_ERROR =
  'Amount must be in steps of 250 IQD (e.g. 250, 500, 1,000, 1,250)';

/**
 * Parses a value as IQD amount. Returns the number only if it's a positive integer
 * and a multiple of IQD_STEP (250). Otherwise returns null.
 */
export function parseAmountIqd(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) return null;
  if (n % IQD_STEP !== 0) return null;
  return n;
}

/** Rounds a number to the nearest valid IQD step (250). */
export function roundToIqdStep(value: number): number {
  const n = Math.floor(Number(value));
  if (n <= 0) return IQD_STEP;
  const rounded = Math.round(n / IQD_STEP) * IQD_STEP;
  return rounded < IQD_STEP ? IQD_STEP : rounded;
}

/** Format number with Western digits (0-9). Use for all displayed amounts. */
export function formatNum(n: number): string {
  return n.toLocaleString('en-US');
}
