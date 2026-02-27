import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startups = await prisma.startup.findMany({
    select: {
      id: true,
      companyName: true,
      ownerUserId: true,
      _count: { select: { documents: true } },
    },
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  return NextResponse.json({
    startups,
    users,
    mapping: startups.map(s => ({
      companyName: s.companyName,
      ownerUserId: s.ownerUserId,
      ownerEmail: users.find(u => u.id === s.ownerUserId)?.email || 'NOT FOUND'
    }))
  });
}
