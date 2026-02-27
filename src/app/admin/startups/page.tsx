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
            <h1 className="text-2xl font-bold text-gray-900">All Startups</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border rounded-lg"
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
            className="px-4 py-2 border rounded-lg"
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
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Stages</option>
            <option value="idea">Idea</option>
            <option value="pre-seed">Pre-Seed</option>
            <option value="seed">Seed</option>
            <option value="series-a">Series A+</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {startups.map((startup) => (
                <tr key={startup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {startup.companyName}
                    </div>
                    <div className="text-sm text-gray-500">{startup.ownerUser.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{startup.stage || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{startup.sector || '-'}</td>
                  <td className="px-6 py-4">
                    <select
                      value={startup.status}
                      onChange={(e) => updateStatus(startup.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${
                        startup.status === 'SHORTLISTED'
                          ? 'bg-green-100 text-green-800'
                          : startup.status === 'SUBMITTED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : startup.status === 'IN_REVIEW'
                          ? 'bg-blue-100 text-blue-800'
                          : startup.status === 'NOT_MOVING_FORWARD'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="SUBMITTED">Submitted</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="FOLLOW_UP">Follow Up</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="NOT_MOVING_FORWARD">Not Moving Forward</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {startup.score ?? '-'}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/startups/${startup.id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {startups.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No startups found.
          </div>
        )}
      </div>
    </div>
  );
}
