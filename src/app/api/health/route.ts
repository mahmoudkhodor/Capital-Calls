import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks: Record<string, { status: string; message?: string }> = {};

  // 1. Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'healthy', message: 'Connected to PostgreSQL' };
  } catch (error: any) {
    checks.database = { status: 'unhealthy', message: error.message };
  }

  // 2. Environment variables check
  const envVars = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
  };

  const missingEnvVars = Object.entries(envVars)
    .filter(([_, exists]) => !exists)
    .map(([name]) => name);

  if (missingEnvVars.length > 0) {
    checks.environment = { status: 'warning', message: `Missing: ${missingEnvVars.join(', ')}` };
  } else {
    checks.environment = { status: 'healthy', message: 'All required env vars set' };
  }

  // 3. Overall status
  const dbHealthy = checks.database.status === 'healthy';
  const allHealthy = dbHealthy && missingEnvVars.length === 0;

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
    version: process.env.VERCEL_DEPLOYMENT_ID ? 'production' : 'development',
  }, {
    status: allHealthy ? 200 : 503,
  });
}
