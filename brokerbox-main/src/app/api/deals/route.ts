export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';
import { parseBody, handleDbError } from '@/lib/api';
import { createDealSchema } from '@/lib/schemas';
import { selectDealsWithRelations, insertDeal } from '@/lib/supabase/queries';

export async function GET() {
  try {
    const deals = await selectDealsWithRelations();
    return NextResponse.json(deals);
  } catch (err) {
    return handleDbError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = parseBody(createDealSchema, raw);
    if (parsed.success === false) return parsed.response;
    const data = { ...parsed.data } as Record<string, unknown>;
    if (
      typeof data.propertyValue === 'number' &&
      typeof data.loanAmount === 'number'
    ) {
      data.ltv = (data.loanAmount as number / data.propertyValue) * 100;
    }
    const deal = (await insertDeal(data)) as { id: string; [key: string]: unknown };
    await logAudit('Deal', deal.id, 'CREATE');
    return NextResponse.json(deal, { status: 201 });
  } catch (err) {
    return handleDbError(err);
  }
}
