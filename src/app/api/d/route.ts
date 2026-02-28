import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const docs = await prisma.startupDocument.findMany({
    include: { startup: { select: { companyName: true } } },
  });
  return NextResponse.json(docs);
}
