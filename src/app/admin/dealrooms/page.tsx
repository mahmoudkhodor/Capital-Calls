'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
            <h1 className="text-2xl font-bold text-gray-900">Deal Rooms</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Manage Deal Rooms</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            {showForm ? 'Cancel' : 'Create Deal Room'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Create
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealRooms.map((room) => (
            <Link
              key={room.id}
              href={`/admin/dealrooms/${room.id}`}
              className="bg-white p-6 rounded-xl border hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg text-gray-900">{room.name}</h3>
              <p className="text-gray-600 text-sm mt-1">
                {room.description || 'No description'}
              </p>
              <div className="flex gap-4 mt-4 text-sm text-gray-500">
                <span>{room._count.startups} startups</span>
                <span>{room._count.investors} investors</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
