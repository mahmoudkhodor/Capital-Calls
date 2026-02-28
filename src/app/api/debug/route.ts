import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true },
  });

  const startups = await prisma.startup.findMany({
    select: { id: true, companyName: true, ownerUserId: true },
  });

  return NextResponse.json({ users, startups });
}
