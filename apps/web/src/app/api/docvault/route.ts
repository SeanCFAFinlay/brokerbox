export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
    const docs = await prisma.docRequest.findMany({
        orderBy: { createdAt: 'desc' },
        include: { files: true, deal: true },
    });
    return NextResponse.json(docs);
}

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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
        let docRequest = await prisma.docRequest.findFirst({
            where: { borrowerId, docType, status: 'requested' }
        });

        if (!docRequest) {
            docRequest = await prisma.docRequest.create({
                data: { borrowerId, dealId, docType, category, status: 'uploaded' }
            });
        } else {
            await prisma.docRequest.update({
                where: { id: docRequest.id },
                data: { status: 'uploaded' }
            });
        }

        const docFile = await prisma.documentFile.create({
            data: {
                docRequestId: docRequest.id,
                filename,
                path: `/uploads/${borrowerId}/${filename}`,
                mimeType: file.type,
                fileSize: file.size
            }
        });

        await logAudit('DocumentFile', docFile.id, 'CREATE', { filename: { old: null, new: filename } });

        return NextResponse.json({ success: true, file: docFile }, { status: 201 });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
