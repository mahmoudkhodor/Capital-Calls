import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendNewApplicationNotification } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { account, ...startupData } = body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: account.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(account.password, 12);

    // Create user and startup
    const user = await prisma.user.create({
      data: {
        email: account.email,
        password: hashedPassword,
        name: account.name,
        role: 'STARTUP',
        startup: {
          create: {
            companyName: startupData.companyName,
            website: startupData.website || null,
            hq: startupData.hq || null,
            incorporationCountry: startupData.incorporationCountry || null,
            stage: startupData.stage || null,
            sector: startupData.sector || null,
            b2bB2c: startupData.b2bB2c || null,
            tractionHighlights: startupData.tractionHighlights || null,
            founders: startupData.founders || null,
            teamRoles: startupData.teamRoles || null,
            linkedin: startupData.linkedin || null,
            problem: startupData.problem || null,
            solution: startupData.solution || null,
            differentiation: startupData.differentiation || null,
            moat: startupData.moat || null,
            revenue: startupData.revenue || null,
            growth: startupData.growth || null,
            users: startupData.users || null,
            retention: startupData.retention || null,
            cac: startupData.cac || null,
            ltv: startupData.ltv || null,
            roundType: startupData.roundType || null,
            targetAmount: startupData.targetAmount || null,
            valuation: startupData.valuation || null,
            useOfFunds: startupData.useOfFunds || null,
            status: 'SUBMITTED',
          },
        },
      },
      include: {
        startup: true,
      },
    });

    // Send notification to admin about new application
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { email: true },
    });
    if (admin?.email) {
      await sendNewApplicationNotification({
        to: admin.email,
        companyName: startupData.companyName,
        founderName: account.name,
      });
    }

    return NextResponse.json({ success: true, userId: user.id, startupId: user.startup?.id });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  }
}
