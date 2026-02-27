import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const documents = await prisma.startupDocument.findMany({
      include: {
        startup: { select: { companyName: true } },
      },
    });

    return NextResponse.json({
      count: documents.length,
      documents: documents.map(d => ({
        id: d.id,
        filename: d.filename,
        type: d.type,
        url: d.url,
        startup: d.startup.companyName,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
