import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Get total counts
  const [
    totalStartups,
    totalInvestors,
    totalDealRooms,
    startupsByStatus,
    startupsBySector,
    startupsByStage,
    avgScore,
  ] = await Promise.all([
    prisma.startup.count(),
    prisma.user.count({ where: { role: 'INVESTOR' } }),
    prisma.dealRoom.count(),
    prisma.startup.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.startup.groupBy({
      by: ['sector'],
      _count: { sector: true },
      where: { sector: { not: null } },
    }),
    prisma.startup.groupBy({
      by: ['stage'],
      _count: { stage: true },
      where: { stage: { not: null } },
    }),
    prisma.startup.aggregate({
      _avg: { score: true },
      where: { score: { not: null } },
    }),
  ]);

  // Calculate conversion rates
  const statusMap = Object.fromEntries(
    startupsByStatus.map(s => [s.status, s._count.status])
  );

  const submitted = statusMap.SUBMITTED || 0;
  const inReview = statusMap.IN_REVIEW || 0;
  const shortlisted = statusMap.SHORTLISTED || 0;
  const notMoving = statusMap.NOT_MOVING_FORWARD || 0;

  const conversionRate = submitted > 0
    ? Math.round((shortlisted / submitted) * 100)
    : 0;

  // Get recent applications (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentApplications = await prisma.startup.count({
    where: {
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  // Get interests
  const interestsByStatus = await prisma.interest.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  const interestMap = Object.fromEntries(
    interestsByStatus.map(i => [i.status, i._count.status])
  );

  return NextResponse.json({
    overview: {
      totalStartups,
      totalInvestors,
      totalDealRooms,
      recentApplications,
      avgScore: Math.round(avgScore._avg.score || 0),
      conversionRate,
    },
    byStatus: startupsByStatus,
    bySector: startupsBySector.filter(s => s.sector),
    byStage: startupsByStage.filter(s => s.stage),
    interests: {
      requested: interestMap.REQUESTED || 0,
      approved: interestMap.APPROVED || 0,
      declined: interestMap.DECLINED || 0,
    },
    funnel: {
      submitted,
      inReview,
      shortlisted,
      notMoving,
    },
  });
}
