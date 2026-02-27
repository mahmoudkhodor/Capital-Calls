import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, name, dealRoomIds } = body;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new investor user with temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'INVESTOR',
        },
      });
    } else {
      // Update existing user to investor role
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'INVESTOR' },
      });
    }

    // Add to deal rooms
    if (dealRoomIds && dealRoomIds.length > 0) {
      for (const dealRoomId of dealRoomIds) {
        await prisma.dealRoomInvestor.upsert({
          where: {
            dealRoomId_investorUserId: {
              dealRoomId,
              investorUserId: user.id,
            },
          },
          update: {},
          create: {
            dealRoomId,
            investorUserId: user.id,
          },
        });
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: 'INVITE_INVESTOR',
        entityType: 'User',
        entityId: user.id,
        meta: JSON.stringify({ email, dealRoomIds }),
      },
    });

    // Email stub
    console.log(`[EMAIL STUB] Sending invite to ${email}`);
    console.log(`  They can now login with their email and set a new password`);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error inviting investor:', error);
    return NextResponse.json({ error: 'Failed to invite investor' }, { status: 500 });
  }
}
