import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const where: any = {};

  if (session.user.role === 'INVESTOR') {
    where.investorId = session.user.id;
  }

  if (status) {
    where.status = status;
  }

  const interests = await prisma.interest.findMany({
    where,
    include: {
      investor: { select: { name: true, email: true } },
      startup: true,
      dealRoom: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(interests);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'INVESTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { startupId, dealRoomId, note } = body;

    // Check if interest already exists
    const existing = await prisma.interest.findFirst({
      where: {
        investorId: session.user.id,
        startupId,
        dealRoomId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You have already expressed interest' },
        { status: 400 }
      );
    }

    const interest = await prisma.interest.create({
      data: {
        investorId: session.user.id,
        startupId,
        dealRoomId,
        note,
        status: 'REQUESTED',
      },
    });

    return NextResponse.json(interest);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create interest' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, founderApproved } = body;

    const interest = await prisma.interest.update({
      where: { id },
      data: {
        status: status === 'APPROVE' ? 'APPROVED' : status === 'DECLINE' ? 'DECLINED' : undefined,
      },
      include: {
        investor: true,
        startup: true,
      },
    });

    // Send email stub
    console.log(`[EMAIL STUB] Sending intro ${status} email to:`);
    console.log(`  Founder: ${interest.startup.companyName}`);
    console.log(`  Investor: ${interest.investor.email}`);
    console.log(`  Note: ${interest.note}`);

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: `INTRO_${status}`,
        entityType: 'Interest',
        entityId: id,
        meta: JSON.stringify({ startupId: interest.startupId, investorId: interest.investorId }),
      },
    });

    return NextResponse.json(interest);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update intro' }, { status: 500 });
  }
}
