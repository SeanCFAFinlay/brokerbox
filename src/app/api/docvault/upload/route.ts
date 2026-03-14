export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
    const formData = (await req.formData()) as any;
    const file = formData.get('file');
    const docRequestId = formData.get('docRequestId');

    if (!file || !docRequestId) {
        return NextResponse.json({ error: 'Missing file or docRequestId' }, { status: 400 });
    }

    // Get current version count
    const existing = await prisma.documentFile.count({ where: { docRequestId } });
    const version = existing + 1;

    // Save to local uploads folder
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filename = `${docRequestId}_v${version}_${file.name}`;
    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Create DB record
    const docFile = await prisma.documentFile.create({
        data: {
            docRequestId,
            filename: file.name,
            path: `/uploads/${filename}`,
            version,
        },
    });

    // Update status
    await prisma.docRequest.update({ where: { id: docRequestId }, data: { status: 'uploaded' } });
    await logAudit('DocumentFile', docFile.id, 'CREATE');

    return NextResponse.json(docFile, { status: 201 });
}
