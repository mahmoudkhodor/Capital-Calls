'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Analytics = {
  overview: {
    totalStartups: number;
    totalInvestors: number;
    totalDealRooms: number;
    recentApplications: number;
    avgScore: number;
    conversionRate: number;
  };
  byStatus: { status: string; _count: { status: number } }[];
  bySector: { sector: string; _count: { sector: number } }[];
  byStage: { stage: string; _count: { stage: number } }[];
  interests: {
    requested: number;
    approved: number;
    declined: number;
  };
  funnel: {
    submitted: number;
    inReview: number;
    shortlisted: number;
    notMoving: number;
  };
};

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/unauthorized');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetch('/api/analytics')
        .then(res => res.json())
        .then(data => setAnalytics(data))
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-white">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="border-b border-white/5 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-white font-semibold">Capital Call</span>
                <span className="px-2 py-0.5 rounded text-xs bg-primary-500/20 text-primary-400">Admin</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/admin" className="text-dark-400 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/admin/analytics" className="text-white font-medium">Analytics</Link>
                <Link href="/admin/pipeline" className="text-dark-400 hover:text-white transition-colors">Pipeline</Link>
                <Link href="/admin/startups" className="text-dark-400 hover:text-white transition-colors">Startups</Link>
                <Link href="/admin/dealrooms" className="text-dark-400 hover:text-white transition-colors">Deal Rooms</Link>
                <Link href="/admin/intros" className="text-dark-400 hover:text-white transition-colors">Intros</Link>
              </nav>
            </div>
            <Link href="/api/auth/signout" className="btn-ghost text-dark-300 hover:text-white">
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="btn-ghost text-dark-300 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="text-dark-400 mt-1">Track your dealroom performance</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Startups', value: analytics.overview.totalStartups, icon: '🏢' },
            { label: 'Active Investors', value: analytics.overview.totalInvestors, icon: '👥' },
            { label: 'Deal Rooms', value: analytics.overview.totalDealRooms, icon: '📁' },
            { label: 'Recent Applications', value: analytics.overview.recentApplications, icon: '📝' },
            { label: 'Avg Score', value: analytics.overview.avgScore, icon: '⭐' },
            { label: 'Conversion Rate', value: `${analytics.overview.conversionRate}%`, icon: '📈' },
          ].map((stat, i) => (
            <div key={stat.label} className="card p-6 bg-dark-900/50 border-dark-800">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-dark-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Funnel */}
        <div className="card bg-dark-900/50 border-dark-800 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Application Funnel</h2>
          <div className="space-y-4">
            {[
              { label: 'Submitted', value: analytics.funnel.submitted, color: 'bg-yellow-500' },
              { label: 'In Review', value: analytics.funnel.inReview, color: 'bg-blue-500' },
              { label: 'Shortlisted', value: analytics.funnel.shortlisted, color: 'bg-green-500' },
              { label: 'Not Moving', value: analytics.funnel.notMoving, color: 'bg-red-500' },
            ].map((item) => {
              const percentage = analytics.funnel.submitted > 0 ? (item.value / analytics.funnel.submitted) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-400">{item.label}</span>
                    <span className="text-white">{item.value}</span>
                  </div>
                  <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* By Sector */}
          <div className="card bg-dark-900/50 border-dark-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">By Sector</h2>
            <div className="space-y-3">
              {analytics.bySector.length === 0 ? (
                <p className="text-dark-500">No data</p>
              ) : (
                analytics.bySector.map((item) => (
                  <div key={item.sector} className="flex justify-between">
                    <span className="text-dark-400 capitalize">{item.sector}</span>
                    <span className="text-white font-medium">{item._count.sector}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* By Stage */}
          <div className="card bg-dark-900/50 border-dark-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">By Stage</h2>
            <div className="space-y-3">
              {analytics.byStage.length === 0 ? (
                <p className="text-dark-500">No data</p>
              ) : (
                analytics.byStage.map((item) => (
                  <div key={item.stage} className="flex justify-between">
                    <span className="text-dark-400 capitalize">{item.stage}</span>
                    <span className="text-white font-medium">{item._count.stage}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
