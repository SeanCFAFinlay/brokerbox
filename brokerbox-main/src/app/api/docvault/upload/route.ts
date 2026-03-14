export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowToApp, appToRow } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import type { TableInsert, TableUpdate } from '@/types/supabase';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const docRequestId = formData.get('docRequestId') as string;

  if (!file || !docRequestId) {
    return NextResponse.json({ error: 'Missing file or docRequestId' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { count } = await supabase
    .from('document_file')
    .select('*', { count: 'exact', head: true })
    .eq('doc_request_id', docRequestId);
  const version = (count ?? 0) + 1;

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  const filename = `${docRequestId}_v${version}_${file.name}`;
  const filePath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const fileRow = appToRow<Record<string, unknown>>({
    docRequestId,
    filename: file.name,
    path: `/uploads/${filename}`,
    version,
  });
  const { data: docFileRow, error } = await supabase
    .from('document_file')
    .insert(fileRow as TableInsert<'document_file'>)
    .select()
    .single();
  if (error) throw error;
  const docFile = rowToApp(docFileRow as Record<string, unknown>);

  await supabase.from('doc_request').update({ status: 'uploaded' } as TableUpdate<'doc_request'>).eq('id', docRequestId);
  await logAudit('DocumentFile', (docFile as { id: string }).id, 'CREATE');

  return NextResponse.json(docFile, { status: 201 });
}
