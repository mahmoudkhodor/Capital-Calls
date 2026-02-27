'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

type Startup = {
  id: string;
  companyName: string;
  sector: string | null;
  stage: string | null;
  score: number | null;
  status: string;
  createdAt: string;
};

const COLUMNS = [
  { id: 'DRAFT', title: 'Draft', color: 'bg-dark-800', borderColor: 'border-dark-700' },
  { id: 'SUBMITTED', title: 'Submitted', color: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  { id: 'FOLLOW_UP', title: 'Follow Up', color: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
  { id: 'SHORTLISTED', title: 'Shortlisted', color: 'bg-green-500/10', borderColor: 'border-green-500/20' },
  { id: 'NOT_MOVING_FORWARD', title: 'Not Moving', color: 'bg-red-500/10', borderColor: 'border-red-500/20' },
];

export default function PipelinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/unauthorized');
    }
  }, [session, status, router]);

  const fetchStartups = async () => {
    const res = await fetch('/api/startups');
    if (res.ok) {
      const data = await res.json();
      setStartups(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchStartups();
    }
  }, [session]);

  const handleDragStart = (e: React.DragEvent, startupId: string) => {
    setDragging(startupId);
    e.dataTransfer.setData('startupId', startupId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const startupId = e.dataTransfer.getData('startupId');

    if (!startupId || !dragging) return;

    setStartups(prev =>
      prev.map(s => s.id === startupId ? { ...s, status: newStatus } : s)
    );
    setDragging(null);

    try {
      const res = await fetch('/api/startups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: startupId, status: newStatus }),
      });

      if (!res.ok) {
        fetchStartups();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      fetchStartups();
    }
  };

  const getColumnStartups = (status: string) => {
    return startups.filter(s => s.status === status);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-white">Loading pipeline...</div>
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
                <Link href="/admin/pipeline" className="text-white font-medium">Pipeline</Link>
                <Link href="/admin/startups" className="text-dark-400 hover:text-white transition-colors">Startups</Link>
                <Link href="/admin/dealrooms" className="text-dark-400 hover:text-white transition-colors">Deal Rooms</Link>
                <Link href="/admin/intros" className="text-dark-400 hover:text-white transition-colors">Intros</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-dark-400">{startups.length} startups</span>
              <Link href="/api/auth/signout" className="btn-ghost text-dark-300 hover:text-white">
                Sign Out
              </Link>
            </div>
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
            <h1 className="text-3xl font-bold text-white">Deal Pipeline</h1>
            <p className="text-dark-400 mt-1">Drag and drop to update status</p>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(column => {
            const columnStartups = getColumnStartups(column.id);
            return (
              <div
                key={column.id}
                className={`flex-shrink-0 w-72 rounded-lg p-3 ${column.color} border ${column.borderColor}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-white">{column.title}</h3>
                  <span className="bg-dark-900 px-2 py-1 rounded-full text-sm font-medium text-dark-300">
                    {columnStartups.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2 min-h-[200px]">
                  {columnStartups.map(startup => (
                    <div
                      key={startup.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, startup.id)}
                      className={`bg-dark-900/80 p-3 rounded-lg border border-dark-700 cursor-move hover:border-primary-500/50 transition ${
                        dragging === startup.id ? 'opacity-50' : ''
                      }`}
                    >
                      <Link href={`/admin/startups/${startup.id}`}>
                        <h4 className="font-medium text-white hover:text-primary-400">
                          {startup.companyName}
                        </h4>
                        <div className="flex gap-2 mt-2 text-xs text-dark-400">
                          <span>{startup.sector || '-'}</span>
                          <span>•</span>
                          <span>{startup.stage || '-'}</span>
                        </div>
                        {startup.score && (
                          <div className="mt-2 text-xs text-primary-400">
                            Score: {startup.score}
                          </div>
                        )}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
