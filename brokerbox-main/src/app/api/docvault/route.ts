export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, rowsToApp, rowToApp, appToRow } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import type { TableInsert, TableUpdate } from '@/types/supabase';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('doc_request')
    .select('*, document_file(*), deal(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return NextResponse.json(rowsToApp(data ?? []));
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const borrowerId = formData.get('borrowerId') as string;
    const dealId = formData.get('dealId') as string || null;
    const docType = formData.get('docType') as string;
    const category = (formData.get('category') as string) || 'general';

    if (!file || !borrowerId || !docType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', borrowerId);
    await mkdir(uploadDir, { recursive: true });
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const supabase = getAdminClient();
    const { data: existing } = await supabase
      .from('doc_request')
      .select('id')
      .eq('borrower_id', borrowerId)
      .eq('doc_type', docType)
      .eq('status', 'requested')
      .limit(1);

    let docRequestId: string;
    if (existing && existing.length > 0) {
      docRequestId = (existing[0] as { id: string }).id;
      await supabase
        .from('doc_request')
        .update({ status: 'uploaded' } as TableUpdate<'doc_request'>)
        .eq('id', docRequestId);
    } else {
      const insertRow = appToRow<Record<string, unknown>>({
        borrowerId,
        dealId,
        docType,
        category,
        status: 'uploaded',
      });
      const { data: newDoc, error: insertErr } = await supabase
        .from('doc_request')
        .insert(insertRow as TableInsert<'doc_request'>)
        .select('id')
        .single();
      if (insertErr) throw insertErr;
      docRequestId = (newDoc as { id: string }).id;
    }

    const fileRow = appToRow<Record<string, unknown>>({
      docRequestId,
      filename,
      path: `/uploads/${borrowerId}/${filename}`,
      mimeType: file.type,
      fileSize: file.size,
    });
    const { data: docFileRow, error: fileErr } = await supabase
      .from('document_file')
      .insert(fileRow as TableInsert<'document_file'>)
      .select()
      .single();
    if (fileErr) throw fileErr;
    const docFile = rowToApp(docFileRow as Record<string, unknown>);

    await logAudit('DocumentFile', (docFile as { id: string }).id, 'CREATE', {
      filename: { old: null, new: filename },
    });
    return NextResponse.json({ success: true, file: docFile }, { status: 201 });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
