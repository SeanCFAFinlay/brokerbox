import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/outlook';

export async function GET() {
    return NextResponse.redirect(getAuthUrl());
}
