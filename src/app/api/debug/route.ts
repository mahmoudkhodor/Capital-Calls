import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();

    // Try to find admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      select: { id: true, email: true, role: true, name: true }
    });

    return NextResponse.json({
      status: 'connected',
      userCount,
      adminFound: !!admin,
      admin: admin || null,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      code: error.code,
    }, { status: 500 });
  }
}
