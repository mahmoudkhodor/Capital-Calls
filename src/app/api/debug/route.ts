import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startups = await prisma.startup.findMany({
    select: {
      id: true,
      companyName: true,
      _count: { select: { documents: true } },
      documents: { select: { id: true, filename: true, url: true, type: true } },
    },
  });
  return NextResponse.json(startups);
}
