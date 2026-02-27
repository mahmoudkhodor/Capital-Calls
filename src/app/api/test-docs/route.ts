import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const docs = await prisma.startupDocument.findMany({
      include: { startup: { select: { companyName: true } } },
    });
    return NextResponse.json({ count: docs.length, docs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
