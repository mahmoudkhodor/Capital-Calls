import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startups = await prisma.startup.findMany({
    select: {
      id: true,
      companyName: true,
      status: true,
      ownerUserId: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json({
    startups,
    users,
    mapping: startups.map(s => ({
      ...s,
      ownerEmail: users.find(u => u.id === s.ownerUserId)?.email || 'NOT FOUND'
    }))
  });
}
