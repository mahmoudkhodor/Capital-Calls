'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Startup {
  id: string;
  companyName: string;
  stage: string | null;
  sector: string | null;
}

interface Investor {
  id: string;
  name: string | null;
  email: string;
}

interface DealRoom {
  id: string;
  name: string;
  description: string | null;
  startups: { startup: Startup }[];
  investors: { investor: Investor }[];
  visibilityConfigs: { visibleFields: string }[];
}

export default function AdminDealRoomDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [dealRoom, setDealRoom] = useState<DealRoom | null>(null);
  const [allStartups, setAllStartups] = useState<Startup[]>([]);
  const [allInvestors, setAllInvestors] = useState<Investor[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/unauthorized');
    } else if (session?.user?.role === 'ADMIN') {
      fetchDealRoom();
      fetchAllStartups();
      fetchAllInvestors();
    }
  }, [session, status, router, params.id]);

  const fetchDealRoom = async () => {
    const res = await fetch(`/api/dealrooms/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setDealRoom(data);
    }
  };

  const fetchAllStartups = async () => {
    const res = await fetch('/api/startups');
    if (res.ok) {
      const data = await res.json();
      setAllStartups(data.map((s: any) => ({ id: s.id, companyName: s.companyName, stage: s.stage, sector: s.sector })));
    }
  };

  const fetchAllInvestors = async () => {
    // Fetch investors from users with INVESTOR role
    const res = await fetch('/api/investors');
    if (res.ok) {
      const data = await res.json();
      setAllInvestors(data);
    }
  };

  const toggleStartup = async (startupId: string, action: 'add' | 'remove') => {
    const currentStartupIds = dealRoom?.startups.map(s => s.startup.id) || [];
    const newStartupIds = action === 'add'
      ? [...currentStartupIds, startupId]
      : currentStartupIds.filter(id => id !== startupId);

    setSaving(true);
    await fetch(`/api/dealrooms/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startupIds: newStartupIds }),
    });
    await fetchDealRoom();
    setSaving(false);
  };

  const toggleInvestor = async (investorId: string, action: 'add' | 'remove') => {
    const currentInvestorIds = dealRoom?.investors.map(i => i.investor.id) || [];
    const newInvestorIds = action === 'add'
      ? [...currentInvestorIds, investorId]
      : currentInvestorIds.filter(id => id !== investorId);

    setSaving(true);
    await fetch(`/api/dealrooms/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ investorIds: newInvestorIds }),
    });
    await fetchDealRoom();
    setSaving(false);
  };

  if (status === 'loading' || !dealRoom) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const currentStartupIds = dealRoom.startups.map(s => s.startup.id);
  const currentInvestorIds = dealRoom.investors.map(i => i.investor.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dealrooms" className="text-gray-600 hover:text-gray-900">
              &larr; Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{dealRoom.name}</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {dealRoom.description && (
          <p className="text-gray-600 mb-6">{dealRoom.description}</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Startups Section */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="text-lg font-semibold mb-4">Startups in this Deal Room</h2>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {dealRoom.startups.length > 0 ? (
                dealRoom.startups.map(({ startup }) => (
                  <div key={startup.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{startup.companyName}</div>
                      <div className="text-sm text-gray-500">{startup.stage} • {startup.sector}</div>
                    </div>
                    <button
                      onClick={() => toggleStartup(startup.id, 'remove')}
                      disabled={saving}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No startups added yet.</p>
              )}
            </div>

            <h3 className="font-medium text-gray-700 mb-2">Add Startups</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allStartups.filter(s => !currentStartupIds.includes(s.id)).map(startup => (
                <div key={startup.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{startup.companyName}</div>
                    <div className="text-sm text-gray-500">{startup.stage} • {startup.sector}</div>
                  </div>
                  <button
                    onClick={() => toggleStartup(startup.id, 'add')}
                    disabled={saving}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Investors Section */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="text-lg font-semibold mb-4">Investors in this Deal Room</h2>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {dealRoom.investors.length > 0 ? (
                dealRoom.investors.map(({ investor }) => (
                  <div key={investor.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{investor.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{investor.email}</div>
                    </div>
                    <button
                      onClick={() => toggleInvestor(investor.id, 'remove')}
                      disabled={saving}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No investors added yet.</p>
              )}
            </div>

            <h3 className="font-medium text-gray-700 mb-2">Add Investors</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allInvestors.filter(i => !currentInvestorIds.includes(i.id)).map(investor => (
                <div key={investor.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{investor.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{investor.email}</div>
                  </div>
                  <button
                    onClick={() => toggleInvestor(investor.id, 'add')}
                    disabled={saving}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
