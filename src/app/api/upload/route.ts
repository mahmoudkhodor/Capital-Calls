import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const startupId = formData.get('startupId') as string;
    const type = formData.get('type') as string;

    if (!file || !startupId) {
      return NextResponse.json(
        { error: 'Missing file or startup ID' },
        { status: 400 }
      );
    }

    // Debug: log if token exists (not the value)
    const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
    console.log('Blob token configured:', hasToken);

    // Generate unique filename
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    console.log('Blob uploaded:', blob.url);

    // Save to database
    const document = await prisma.startupDocument.create({
      data: {
        startupId,
        type: type || 'pitch_deck',
        filename: file.name,
        url: blob.url,
      },
    });

    return NextResponse.json(document);
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}

// Use force-dynamic to disable static caching for this route
export const dynamic = 'force-dynamic';
