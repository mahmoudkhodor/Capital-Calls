'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  { id: 'DRAFT', title: 'Draft', color: 'bg-gray-100' },
  { id: 'SUBMITTED', title: 'Submitted', color: 'bg-yellow-100' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'bg-blue-100' },
  { id: 'FOLLOW_UP', title: 'Follow Up', color: 'bg-orange-100' },
  { id: 'SHORTLISTED', title: 'Shortlisted', color: 'bg-green-100' },
  { id: 'NOT_MOVING_FORWARD', title: 'Not Moving', color: 'bg-red-100' },
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

    // Optimistic update
    setStartups(prev =>
      prev.map(s => s.id === startupId ? { ...s, status: newStatus } : s)
    );
    setDragging(null);

    // API call to update status
    try {
      const res = await fetch('/api/startups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: startupId, status: newStatus }),
      });

      if (!res.ok) {
        // Revert on error
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading pipeline...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              &larr; Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
          </div>
          <div className="text-sm text-gray-500">
            {startups.length} startups
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(column => {
            const columnStartups = getColumnStartups(column.id);
            return (
              <div
                key={column.id}
                className={`flex-shrink-0 w-72 ${column.color} rounded-lg p-3`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">{column.title}</h3>
                  <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
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
                      className={`bg-white p-3 rounded-lg shadow-sm cursor-move hover:shadow-md transition ${
                        dragging === startup.id ? 'opacity-50' : ''
                      }`}
                    >
                      <Link href={`/admin/startups/${startup.id}`}>
                        <h4 className="font-medium text-gray-900 hover:text-blue-600">
                          {startup.companyName}
                        </h4>
                      </Link>
                      <div className="flex gap-2 mt-2 text-xs text-gray-500">
                        {startup.sector && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded">
                            {startup.sector}
                          </span>
                        )}
                        {startup.stage && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded">
                            {startup.stage}
                          </span>
                        )}
                      </div>
                      {startup.score !== null && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                startup.score >= 70 ? 'bg-green-500' :
                                startup.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${startup.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {startup.score}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {columnStartups.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Drop startups here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
