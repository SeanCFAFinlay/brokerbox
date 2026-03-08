import { PrismaClient } from '@brokerbox/database';

export interface StorageConfig {
    provider: 'supabase' | 's3';
    bucket: string;
}

export async function uploadDocument(
    file: Buffer,
    filename: string,
    dealId: string,
    type: string
) {
    // Placeholder for actual storage provider integration
    console.log(`Uploading ${filename} for deal ${dealId} as type ${type}`);

    // In a real implementation:
    // 1. Upload to S3/Supabase
    // 2. Get the public URL
    const fileUrl = `https://storage.brokerbox.ca/deals/${dealId}/${filename}`;

    return fileUrl;
}

export async function getDealDocuments(prisma: PrismaClient, dealId: string) {
    return prisma.docRequest.findMany({
        where: { dealId },
        include: { files: true },
    });
}
