import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dealRooms = await prisma.dealRoom.findMany({
    include: {
      startups: {
        include: { startup: true },
      },
      investors: {
        include: { investor: true },
      },
      visibilityConfigs: true,
      _count: {
        select: { startups: true, investors: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(dealRooms);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, startupIds, investorIds, visibleFields } = body;

    const dealRoom = await prisma.dealRoom.create({
      data: {
        name,
        description,
        createdByAdminId: session.user.id,
        startups: {
          create: startupIds?.map((id: string) => ({ startupId: id })) || [],
        },
        investors: {
          create: investorIds?.map((id: string) => ({ investorUserId: id })) || [],
        },
        visibilityConfigs: {
          create: {
            visibleFields: JSON.stringify(visibleFields || getDefaultVisibleFields()),
          },
        },
      },
      include: {
        startups: true,
        investors: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: 'CREATE_DEALROOM',
        entityType: 'DealRoom',
        entityId: dealRoom.id,
        meta: JSON.stringify({ name }),
      },
    });

    return NextResponse.json(dealRoom);
  } catch (error) {
    console.error('Error creating deal room:', error);
    return NextResponse.json({ error: 'Failed to create deal room' }, { status: 500 });
  }
}

function getDefaultVisibleFields() {
  return [
    'companyName',
    'website',
    'hq',
    'stage',
    'sector',
    'b2bB2c',
    'tractionHighlights',
    'problem',
    'solution',
    'differentiation',
    'founders',
    'roundType',
    'targetAmount',
    'useOfFunds',
  ];
}
