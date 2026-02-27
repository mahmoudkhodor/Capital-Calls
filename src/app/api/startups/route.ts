import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendStartupStatusChange, sendNewApplicationNotification } from '@/lib/email';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const sector = searchParams.get('sector');
  const stage = searchParams.get('stage');

  const where: any = {};

  if (status) where.status = status;
  if (sector) where.sector = sector;
  if (stage) where.stage = stage;

  const startups = await prisma.startup.findMany({
    where,
    include: {
      ownerUser: {
        select: { email: true, name: true },
      },
      documents: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(startups);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;

    const startup = await prisma.startup.update({
      where: { id },
      data,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: 'UPDATE_STARTUP',
        entityType: 'Startup',
        entityId: id,
        meta: JSON.stringify(data),
      },
    });

    // Send email notification if status changed
    if (data.status) {
      const owner = await prisma.user.findUnique({
        where: { id: startup.ownerUserId },
        select: { email: true },
      });
      if (owner?.email) {
        await sendStartupStatusChange({
          to: owner.email,
          companyName: startup.companyName,
          newStatus: data.status,
        });
      }
    }

    return NextResponse.json(startup);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
