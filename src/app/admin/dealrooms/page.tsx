'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface DealRoom {
  id: string;
  name: string;
  description: string | null;
  startups: { startup: any }[];
  investors: { investor: any }[];
  _count: { startups: number; investors: number };
}

export default function AdminDealRooms() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dealRooms, setDealRooms] = useState<DealRoom[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/unauthorized');
    } else if (session?.user?.role === 'ADMIN') {
      fetchDealRooms();
    }
  }, [session, status, router]);

  const fetchDealRooms = async () => {
    const res = await fetch('/api/dealrooms');
    if (res.ok) {
      const data = await res.json();
      setDealRooms(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/dealrooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ name: '', description: '' });
      setShowForm(false);
      fetchDealRooms();
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
                <Link href="/admin/dealrooms" className="text-white font-medium">Deal Rooms</Link>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="btn-ghost text-dark-300 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Deal Rooms</h1>
              <p className="text-dark-400 mt-1">Create and manage investor lists</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? 'Cancel' : 'Create Deal Room'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card bg-dark-900/50 border-dark-800 p-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="label text-dark-300">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input bg-dark-900/50 border-dark-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="label text-dark-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input bg-dark-900/50 border-dark-700 text-white"
                  rows={3}
                />
              </div>
              <button type="submit" className="btn-primary">
                Create
              </button>
            </div>
          </form>
        )}

        {/* Deal Rooms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealRooms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-dark-500">No deal rooms yet. Create one to get started.</p>
            </div>
          ) : (
            dealRooms.map((room) => (
              <Link
                key={room.id}
                href={`/admin/dealrooms/${room.id}`}
                className="card p-6 bg-dark-900/50 border-dark-800 hover:border-primary-500/30 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{room.name}</h3>
                <p className="text-dark-400 text-sm mb-4">{room.description || 'No description'}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-dark-500">
                    <span className="text-white font-medium">{room._count.startups}</span> startups
                  </span>
                  <span className="text-dark-500">
                    <span className="text-white font-medium">{room._count.investors}</span> investors
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
