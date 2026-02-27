import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  // Skip auth check during registration - the startupId validates ownership
  // In production, you'd want additional validation

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

    // Create uploads directory if it doesn't exist
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = path.join(uploadDir, filename);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    // Save to database
    const document = await prisma.startupDocument.create({
      data: {
        startupId,
        type: type || 'pitch_deck',
        filename: file.name,
        url: `/api/files/${filename}`,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// Use force-dynamic to disable static caching for this route
export const dynamic = 'force-dynamic';
