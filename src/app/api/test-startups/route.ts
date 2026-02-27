import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const startups = await prisma.startup.findMany({
      select: {
        id: true,
        companyName: true,
        status: true,
        ownerUserId: true,
        _count: { select: { documents: true } },
      },
    });

    return NextResponse.json({
      count: startups.length,
      startups,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
