import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
    try {
        const formData = (await req.formData()) as any;
        const file = formData.get('file');
        const docRequestId = formData.get('docRequestId');

        if (!file || !docRequestId) {
            return NextResponse.json({ error: 'Missing file or docRequestId' }, { status: 400 });
        }

        // Get current version count
        const { count, error: countError } = await supabase
            .from('DocumentFile')
            .select('*', { count: 'exact', head: true })
            .eq('docRequestId', docRequestId);
        
        if (countError) throw countError;
        const version = (count || 0) + 1;

        // Save to local uploads folder
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        const filename = `${docRequestId}_v${version}_${file.name}`;
        const filePath = path.join(uploadDir, filename);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        // Create DB record
        const { data: docFile, error: fileError } = await supabase.from('DocumentFile').insert({
            docRequestId,
            filename: file.name,
            path: `/uploads/${filename}`,
            version,
        }).select().single();

        if (fileError) throw fileError;

        // Update status
        await supabase.from('DocRequest').update({ status: 'uploaded' }).eq('id', docRequestId);
        await logAudit('DocumentFile', docFile.id, 'CREATE');

        return NextResponse.json(docFile, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
