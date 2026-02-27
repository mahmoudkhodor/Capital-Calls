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

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  IN_REVIEW: 'bg-blue-100 text-blue-800',
  FOLLOW_UP: 'bg-orange-100 text-orange-800',
  SHORTLISTED: 'bg-green-100 text-green-800',
  NOT_MOVING_FORWARD: 'bg-red-100 text-red-800',
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              &larr; Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{analytics.overview.totalStartups}</div>
            <div className="text-sm text-gray-600">Total Startups</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{analytics.overview.totalInvestors}</div>
            <div className="text-sm text-gray-600">Investors</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{analytics.overview.totalDealRooms}</div>
            <div className="text-sm text-gray-600">Deal Rooms</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{analytics.overview.recentApplications}</div>
            <div className="text-sm text-gray-600">Last 30 Days</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">{analytics.overview.avgScore}</div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{analytics.overview.conversionRate}%</div>
            <div className="text-sm text-gray-600">Conversion</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pipeline Funnel */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Pipeline Funnel</h2>
            <div className="space-y-3">
              {[
                { label: 'Submitted', value: analytics.funnel.submitted, color: 'bg-yellow-500' },
                { label: 'In Review', value: analytics.funnel.inReview, color: 'bg-blue-500' },
                { label: 'Shortlisted', value: analytics.funnel.shortlisted, color: 'bg-green-500' },
                { label: 'Not Moving', value: analytics.funnel.notMoving, color: 'bg-red-500' },
              ].map(item => {
                const percentage = analytics.overview.totalStartups > 0
                  ? Math.round((item.value / analytics.overview.totalStartups) * 100)
                  : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium">{item.value} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">By Status</h2>
            <div className="space-y-2">
              {analytics.byStatus.map(item => (
                <div key={item.status} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status] || 'bg-gray-100'}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                  <span className="font-semibold">{item._count.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Sector */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">By Sector</h2>
            <div className="space-y-2">
              {analytics.bySector.length > 0 ? (
                analytics.bySector.map(item => (
                  <div key={item.sector} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-700">{item.sector}</span>
                    <span className="font-semibold">{item._count.sector}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No sector data available</p>
              )}
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Intro Requests</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{analytics.interests.requested}</div>
                <div className="text-sm text-gray-600">Requested</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analytics.interests.approved}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{analytics.interests.declined}</div>
                <div className="text-sm text-gray-600">Declined</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
