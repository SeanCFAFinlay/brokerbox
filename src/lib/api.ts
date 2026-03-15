/**
 * Shared API helpers: Zod body parsing and consistent error responses.
 */

import { NextResponse } from 'next/server';
import type { ZodType } from 'zod';

export function parseBody<T>(schema: ZodType<T>, body: unknown): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const issues = result.error.issues ?? [];
  const first = issues[0];
  const message = first ? `${String((first as { path?: unknown[] }).path?.join('.') ?? '')}: ${(first as { message?: string }).message ?? 'Invalid'}` : 'Validation failed';
  const details = issues.map((e: { path?: unknown[]; message?: string }) => ({ path: (e.path ?? []).join('.'), message: e.message ?? 'Invalid' }));
  return {
    success: false,
    response: NextResponse.json(
      { error: message, details },
      { status: 400 }
    ),
  };
}

export function jsonError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleDatabaseError(err: unknown): NextResponse {
  const msg = err instanceof Error ? err.message : String(err);
  console.error('Database error:', err);
  
  if (msg.includes('unique constraint') || msg.includes('23505')) {
    return NextResponse.json({ error: 'A record with this value already exists.' }, { status: 409 });
  }
  if (msg.includes('not found') || msg.includes('P2025')) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }
  if (msg.includes('foreign key') || msg.includes('23503')) {
    return NextResponse.json({ error: 'Invalid reference (e.g. borrower or lender does not exist).' }, { status: 400 });
  }
  
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
}


