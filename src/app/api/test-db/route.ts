import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    });

    // Check admin password
    const admin = users.find(u => u.email === 'admin@example.com');
    let passwordCheck = null;

    if (admin?.password) {
      const isValid = await bcrypt.compare('admin123', admin.password);
      passwordCheck = isValid ? 'Valid' : 'Invalid';
    }

    return NextResponse.json({
      userCount: users.length,
      users: users.map(u => ({ ...u, password: '[HIDDEN]' })),
      adminPasswordCheck: passwordCheck,
      status: 'connected'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
