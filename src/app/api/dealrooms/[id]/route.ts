import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'INVESTOR') {
    // Admins can also view
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const dealRoom = await prisma.dealRoom.findUnique({
    where: { id: params.id },
    include: {
      startups: {
        include: { startup: true },
      },
      investors: {
        include: { investor: true },
      },
      visibilityConfigs: true,
    },
  });

  if (!dealRoom) {
    return NextResponse.json({ error: 'Deal room not found' }, { status: 404 });
  }

  // Check access for investors
  if (session.user.role === 'INVESTOR') {
    const hasAccess = dealRoom.investors.some(
      (i) => i.investorUserId === session.user.id
    );
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
  }

  return NextResponse.json(dealRoom);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { startupIds, investorIds, visibleFields, ...dealRoomData } = body;

    // Update deal room basic info
    if (Object.keys(dealRoomData).length > 0) {
      await prisma.dealRoom.update({
        where: { id: params.id },
        data: dealRoomData,
      });
    }

    // Update startups
    if (startupIds !== undefined) {
      await prisma.dealRoomStartup.deleteMany({
        where: { dealRoomId: params.id },
      });
      if (startupIds.length > 0) {
        await prisma.dealRoomStartup.createMany({
          data: startupIds.map((startupId: string) => ({
            dealRoomId: params.id,
            startupId,
          })),
        });
      }
    }

    // Update investors
    if (investorIds !== undefined) {
      await prisma.dealRoomInvestor.deleteMany({
        where: { dealRoomId: params.id },
      });
      if (investorIds.length > 0) {
        await prisma.dealRoomInvestor.createMany({
          data: investorIds.map((investorUserId: string) => ({
            dealRoomId: params.id,
            investorUserId,
          })),
        });
      }
    }

    // Update visibility config
    if (visibleFields !== undefined) {
      await prisma.visibilityConfig.upsert({
        where: { dealRoomId: params.id },
        update: { visibleFields: JSON.stringify(visibleFields) },
        create: {
          dealRoomId: params.id,
          visibleFields: JSON.stringify(visibleFields),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating deal room:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
