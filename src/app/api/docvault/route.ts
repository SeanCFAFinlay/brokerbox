import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const { data: docs, error } = await supabase
            .from('DocRequest')
            .select('*, files:DocumentFile(*), deal:Deal(*)')
            .order('createdAt', { ascending: false });

        if (error) throw error;
        return NextResponse.json(docs ?? []);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const borrowerId = formData.get('borrowerId') as string;
        const dealId = formData.get('dealId') as string || null;
        const docType = formData.get('docType') as string;
        const category = formData.get('category') as string || 'general';

        if (!file || !borrowerId || !docType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create directory structure
        const uploadDir = join(process.cwd(), 'public', 'uploads', borrowerId);
        await mkdir(uploadDir, { recursive: true });

        // 2. Write file to disk
        const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const filePath = join(uploadDir, filename);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // 3. Create records in DB
        // First find if a request exists, or create a new one
        const { data: existingRequest } = await supabase
            .from('DocRequest')
            .select('*')
            .eq('borrowerId', borrowerId)
            .eq('docType', docType)
            .eq('status', 'requested')
            .maybeSingle();

        let docRequest;
        if (!existingRequest) {
            const { data: newRequest, error: createError } = await supabase
                .from('DocRequest')
                .insert({ borrowerId, dealId, docType, category, status: 'uploaded' })
                .select()
                .single();
            if (createError) throw createError;
            docRequest = newRequest;
        } else {
            const { data: updatedRequest, error: updateError } = await supabase
                .from('DocRequest')
                .update({ status: 'uploaded' })
                .eq('id', existingRequest.id)
                .select()
                .single();
            if (updateError) throw updateError;
            docRequest = updatedRequest;
        }

        const { data: docFile, error: fileError } = await supabase
            .from('DocumentFile')
            .insert({
                docRequestId: docRequest.id,
                filename,
                path: `/uploads/${borrowerId}/${filename}`,
                mimeType: file.type,
                fileSize: file.size
            })
            .select()
            .single();

        if (fileError) throw fileError;

        await logAudit('DocumentFile', docFile.id, 'CREATE', { filename: { old: null, new: filename } });

        return NextResponse.json({ success: true, file: docFile }, { status: 201 });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
