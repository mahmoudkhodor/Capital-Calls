import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const docs = await prisma.startupDocument.findMany({
    include: { startup: { select: { companyName: true } } },
  });
  return NextResponse.json(docs);
}
