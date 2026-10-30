import snapshot from './data/amazon-prices.json' with { type: 'json' };

export interface AmazonPriceRecord {
  asin: string;
  currency: 'JPY';
  price: number | null;
  fetchedAt: string | null;
  attemptedAt: string;
  status: 'ok' | 'unavailable' | 'blocked' | 'error';
  error: string | null;
}

export const MAX_PRICE_AGE_MS = 36 * 60 * 60 * 1000;
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isDate = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value));

/** Ignore malformed data and prices belonging to a replaced ASIN. */
export function amazonPriceRecord(id: string, asin: string, data: unknown = snapshot): AmazonPriceRecord | null {
  if (!isRecord(data) || data.schemaVersion !== 1 || !isRecord(data.products)) return null;
  const row = data.products[id];
  if (!isRecord(row) || row.asin !== asin || row.currency !== 'JPY' || !isDate(row.attemptedAt)) return null;
  if (!['ok', 'unavailable', 'blocked', 'error'].includes(String(row.status))) return null;
  if (row.price !== null && !(typeof row.price === 'number' && Number.isSafeInteger(row.price) && row.price > 0 && row.price <= 10_000_000)) return null;
  if (row.fetchedAt !== null && !isDate(row.fetchedAt)) return null;
  if (row.price !== null && row.fetchedAt === null) return null;
  if (row.status === 'ok' && row.price === null) return null;
  if (row.status === 'unavailable' && row.price !== null) return null;
  if (row.error !== null && typeof row.error !== 'string') return null;
  return row as unknown as AmazonPriceRecord;
}

export function currentAmazonPrice(row: AmazonPriceRecord | null, now = Date.now()): number | null {
  if (!row || row.status !== 'ok' || row.price === null || !row.fetchedAt) return null;
  const age = now - Date.parse(row.fetchedAt);
  return age >= 0 && age <= MAX_PRICE_AGE_MS ? row.price : null;
}
