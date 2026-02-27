'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              &larr; Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Intro Requests</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['REQUESTED', 'APPROVED', 'DECLINED', 'ALL'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Intros List */}
        <div className="space-y-4">
          {filteredIntros.length > 0 ? (
            filteredIntros.map((intro) => (
              <div key={intro.id} className="bg-white p-6 rounded-xl border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {intro.startup.companyName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {intro.startup.stage} • {intro.startup.sector}
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>
                        <span className="font-medium">Investor:</span> {intro.investor.name || intro.investor.email}
                      </p>
                      {intro.dealRoom && (
                        <p>
                          <span className="font-medium">Deal Room:</span> {intro.dealRoom.name}
                        </p>
                      )}
                      {intro.note && (
                        <p className="mt-2 italic">&quot;{intro.note}&quot;</p>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(intro.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {intro.status === 'REQUESTED' && (
                      <>
                        <button
                          onClick={() => handleAction(intro.id, 'APPROVE')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(intro.id, 'DECLINE')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    <span
                      className={`px-3 py-2 rounded-full text-xs font-medium ${
                        intro.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : intro.status === 'DECLINED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {intro.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-xl border text-center text-gray-500">
              No intro requests found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
