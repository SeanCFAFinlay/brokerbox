/**
 * Map between Supabase (snake_case) and app/Prisma-style (camelCase).
 */

function toCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function mapKeys<T>(obj: T, fn: (k: string) => string): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => mapKeys(item, fn)) as T;
  }
  if (typeof obj === 'object' && obj.constructor === Object) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[fn(k)] = mapKeys(v as Record<string, unknown>, fn);
    }
    return out as T;
  }
  return obj;
}

export function rowToApp<T>(row: Record<string, unknown>): T {
  return mapKeys(row, toCamel) as T;
}

export function appToRow<T>(app: Record<string, unknown>): T {
  return mapKeys(app, toSnake) as T;
}

export function rowsToApp<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((r) => rowToApp<T>(r));
}
