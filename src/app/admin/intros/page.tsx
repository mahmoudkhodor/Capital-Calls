'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface Interest {
  id: string;
  note: string | null;
  status: string;
  createdAt: string;
  investor: { name: string | null; email: string };
  startup: { companyName: string; stage: string; sector: string };
  dealRoom: { name: string } | null;
}

export default function AdminIntros() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [intros, setIntros] = useState<Interest[]>([]);
  const [filter, setFilter] = useState('REQUESTED');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/unauthorized');
    } else if (session?.user?.role === 'ADMIN') {
      fetchIntros();
    }
  }, [session, status, router]);

  const fetchIntros = async () => {
    const res = await fetch('/api/intros');
    if (res.ok) {
      const data = await res.json();
      setIntros(data);
    }
  };

  const handleAction = async (id: string, action: 'APPROVE' | 'DECLINE') => {
    const res = await fetch('/api/intros', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: action }),
    });

    if (res.ok) {
      fetchIntros();
    }
  };

  const filteredIntros = intros.filter((i) =>
    filter === 'ALL' ? true : i.status === filter
  );

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
                <Logo size="sm" />
                  
                </div>
                <span className="text-white font-semibold">Capital Call</span>
                <span className="px-2 py-0.5 rounded text-xs bg-primary-500/20 text-primary-400">Admin</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/admin" className="text-dark-400 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/admin/analytics" className="text-dark-400 hover:text-white transition-colors">Analytics</Link>
                <Link href="/admin/pipeline" className="text-dark-400 hover:text-white transition-colors">Pipeline</Link>
                <Link href="/admin/startups" className="text-dark-400 hover:text-white transition-colors">Startups</Link>
                <Link href="/admin/dealrooms" className="text-dark-400 hover:text-white transition-colors">Deal Rooms</Link>
                <Link href="/admin/intros" className="text-white font-medium">Intros</Link>
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
            <h1 className="text-3xl font-bold text-white">Intro Requests</h1>
            <p className="text-dark-400 mt-1">Review and manage investor introduction requests</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['REQUESTED', 'APPROVED', 'DECLINED', 'ALL'].map((statusFilter) => (
            <button
              key={statusFilter}
              onClick={() => setFilter(statusFilter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === statusFilter
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-dark-400 border border-dark-700 hover:border-primary-500/50'
              }`}
            >
              {statusFilter}
            </button>
          ))}
        </div>

        {/* Intros List */}
        <div className="space-y-4">
          {filteredIntros.length > 0 ? (
            filteredIntros.map((intro) => (
              <div key={intro.id} className="card bg-dark-900/50 border-dark-800 p-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-lg text-white">
                      {intro.startup.companyName}
                    </h3>
                    <p className="text-dark-400 text-sm">
                      {intro.startup.stage} • {intro.startup.sector}
                    </p>
                    <div className="mt-3 text-sm">
                      <p className="text-dark-500">
                        <span className="text-dark-400 font-medium">Investor:</span> {intro.investor.name || intro.investor.email}
                      </p>
                      {intro.dealRoom && (
                        <p className="text-dark-500">
                          <span className="text-dark-400 font-medium">Deal Room:</span> {intro.dealRoom.name}
                        </p>
                      )}
                      {intro.note && (
                        <p className="mt-2 text-dark-400 italic">&quot;{intro.note}&quot;</p>
                      )}
                    </div>
                    <p className="text-dark-600 text-xs mt-3">
                      {new Date(intro.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {intro.status === 'REQUESTED' && (
                      <>
                        <button
                          onClick={() => handleAction(intro.id, 'APPROVE')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(intro.id, 'DECLINE')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    <span className={`badge ${
                      intro.status === 'APPROVED'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : intro.status === 'DECLINED'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {intro.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-dark-500">No intro requests found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
