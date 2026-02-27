'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Startup {
  id: string;
  companyName: string;
  stage: string | null;
  sector: string | null;
  status: string;
  score: number | null;
  createdAt: string;
  ownerUser: { email: string };
}

export default function AdminStartups() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filter, setFilter] = useState({ status: '', sector: '', stage: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/unauthorized');
    } else if (session?.user?.role === 'ADMIN') {
      fetchStartups();
    }
  }, [session, status, router]);

  const fetchStartups = async () => {
    const params = new URLSearchParams();
    if (filter.status) params.append('status', filter.status);
    if (filter.sector) params.append('sector', filter.sector);
    if (filter.stage) params.append('stage', filter.stage);

    const res = await fetch(`/api/startups?${params}`);
    if (res.ok) {
      const data = await res.json();
      setStartups(data);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchStartups();
    }
  }, [filter, session]);

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch('/api/startups', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });

    if (res.ok) {
      fetchStartups();
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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
                <Link href="/admin/analytics" className="text-dark-400 hover:text-white transition-colors">Analytics</Link>
                <Link href="/admin/pipeline" className="text-dark-400 hover:text-white transition-colors">Pipeline</Link>
                <Link href="/admin/startups" className="text-white font-medium">Startups</Link>
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
            <h1 className="text-3xl font-bold text-white">All Startups</h1>
            <p className="text-dark-400 mt-1">Manage and review startup applications</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="input bg-dark-900/50 border-dark-700 text-white"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="NOT_MOVING_FORWARD">Not Moving Forward</option>
          </select>
          <select
            value={filter.sector}
            onChange={(e) => setFilter({ ...filter, sector: e.target.value })}
            className="input bg-dark-900/50 border-dark-700 text-white"
          >
            <option value="">All Sectors</option>
            <option value="fintech">Fintech</option>
            <option value="saas">SaaS</option>
            <option value="healthtech">Healthtech</option>
            <option value="ecommerce">E-commerce</option>
            <option value="ai-ml">AI/ML</option>
          </select>
          <select
            value={filter.stage}
            onChange={(e) => setFilter({ ...filter, stage: e.target.value })}
            className="input bg-dark-900/50 border-dark-700 text-white"
          >
            <option value="">All Stages</option>
            <option value="idea">Idea</option>
            <option value="pre-seed">Pre-Seed</option>
            <option value="seed">Seed</option>
            <option value="series-a">Series A+</option>
          </select>
        </div>

        {/* Table */}
        <div className="card bg-dark-900/50 border-dark-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase">Stage</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase">Sector</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {startups.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-dark-500">
                      No startups found
                    </td>
                  </tr>
                ) : (
                  startups.map((startup) => (
                    <tr key={startup.id} className="hover:bg-dark-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{startup.companyName}</div>
                        <div className="text-sm text-dark-500">{startup.ownerUser.email}</div>
                      </td>
                      <td className="px-6 py-4 text-dark-400">{startup.stage || '-'}</td>
                      <td className="px-6 py-4 text-dark-400">{startup.sector || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          startup.status === 'SHORTLISTED'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : startup.status === 'SUBMITTED'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : startup.status === 'IN_REVIEW'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-dark-700 text-dark-400 border border-dark-600'
                        }`}>
                          {startup.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-400">{startup.score || '-'}</td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/startups/${startup.id}`} className="text-primary-500 hover:text-primary-400 font-medium">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
