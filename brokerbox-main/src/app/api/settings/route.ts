export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowToApp, appToRow } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import type { TableInsert } from '@/types/supabase';

export async function GET() {
  const supabase = getAdminClient();
  let { data: settings } = await supabase
    .from('brokerage_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (!settings) {
    const { data: inserted } = await supabase
      .from('brokerage_settings')
      .insert({ id: 'default', brokerage_name: 'BrokerBox Financial Group' } as TableInsert<'brokerage_settings'>)
      .select()
      .single();
    settings = inserted;
  }

  const { data: userRow } = await supabase
    .from('user')
    .select('outlook_enabled')
    .eq('email', 'broker@demo.com')
    .limit(1)
    .single();

  const app = rowToApp(settings as Record<string, unknown>) as Record<string, unknown>;
  app.outlookEnabled = (userRow as { outlook_enabled?: boolean } | null)?.outlook_enabled ?? false;
  return NextResponse.json(app);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  ['defaultBrokerFee', 'defaultLenderFee', 'defaultTermMonths', 'defaultAmortMonths', 'defaultInterestRate'].forEach(
    (k) => {
      if (body[k] !== undefined) body[k] = Number(body[k]);
    }
  );

  const supabase = getAdminClient();
  const { data: oldRow } = await supabase
    .from('brokerage_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  const row = appToRow<Record<string, unknown>>(body);
  const { data: settingsRow, error } = await supabase
    .from('brokerage_settings')
    .upsert({ id: 'default', ...row }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;

  const old = oldRow ? (rowToApp(oldRow as Record<string, unknown>) as Record<string, unknown>) : null;
  if (old) {
    const diff: Record<string, { old: unknown; new: unknown }> = {};
    for (const key of Object.keys(body)) {
      if (old[key] !== body[key]) diff[key] = { old: old[key], new: body[key] };
    }
    await logAudit('Settings', 'default', 'UPDATE', diff);
  } else {
    await logAudit('Settings', 'default', 'CREATE');
  }
  return NextResponse.json(rowToApp(settingsRow as Record<string, unknown>));
}
