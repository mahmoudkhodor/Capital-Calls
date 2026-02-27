import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized', session: null }, { status: 401 });
  }

  // Debug: return session info
  const debugInfo = {
    userId: session.user.id,
    userEmail: session.user.email,
    userRole: session.user.role,
  };

  const startup = await prisma.startup.findUnique({
    where: { ownerUserId: session.user.id },
    include: { documents: true },
  });

  if (!startup) {
    return NextResponse.json({
      error: 'No startup found for this user',
      debug: debugInfo,
      allStartups: await prisma.startup.findMany({ select: { id: true, ownerUserId: true, companyName: true } })
    }, { status: 404 });
  }

  return NextResponse.json(startup);
}
