import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const startupId = formData.get('startupId') as string;
    const type = formData.get('type') as string;

    console.log('Upload request - startupId:', startupId, 'file:', file?.name, 'type:', type);

    if (!file || !startupId) {
      return NextResponse.json(
        { error: 'Missing file or startup ID', received: { file: !!file, startupId } },
        { status: 400 }
      );
    }

    // Generate unique filename
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Upload to Vercel Blob (public store)
    const blob = await put(filename, file, { access: 'public' });

    console.log('Blob uploaded successfully:', blob.url);

    // Save to database
    const document = await prisma.startupDocument.create({
      data: {
        startupId,
        type: type || 'pitch_deck',
        filename: file.name,
        url: blob.url,
      },
    });

    console.log('Document saved:', document);

    return NextResponse.json(document);
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed', stack: error.stack }, { status: 500 });
  }
}

// Use force-dynamic to disable static caching for this route
export const dynamic = 'force-dynamic';
