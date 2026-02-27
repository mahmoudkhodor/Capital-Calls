import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startup = await prisma.startup.findUnique({
    where: { id: params.id },
    include: {
      documents: true,
      ownerUser: { select: { email: true, name: true } },
    },
  });

  if (!startup) {
    return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
  }

  return NextResponse.json(startup);
}
