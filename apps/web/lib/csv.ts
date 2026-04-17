/**
 * CSV escaping helper — shared by earnings (Story 5.8) and ops/finance
 * exports (Stories 5.10, 5.11). Mitigates CSV formula injection by
 * prefixing any leading =, +, -, @ value with a single quote.
 */

export function sanitizeCsvField(value: unknown): string {
  const str = value == null ? '' : String(value);
  const needsQuote = /[",\r\n]/.test(str);
  const leadingDangerous = /^[=+\-@]/.test(str);
  const safe = leadingDangerous ? `'${str}` : str;
  const escaped = safe.replace(/"/g, '""');
  return needsQuote || leadingDangerous ? `"${escaped}"` : escaped;
}

export function toCsv(rows: Array<readonly unknown[]>): string {
  return rows.map((row) => row.map(sanitizeCsvField).join(',')).join('\n');
}
