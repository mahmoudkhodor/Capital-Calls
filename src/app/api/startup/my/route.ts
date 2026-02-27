import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startup = await prisma.startup.findUnique({
    where: { ownerUserId: session.user.id },
    include: { documents: true },
  });

  if (!startup) {
    return NextResponse.json({ error: 'No startup found' }, { status: 404 });
  }

  return NextResponse.json(startup);
}
