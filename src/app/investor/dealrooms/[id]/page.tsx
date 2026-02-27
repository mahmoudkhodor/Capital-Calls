'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface Startup {
  id: string;
  companyName: string;
  website: string | null;
  stage: string | null;
  sector: string | null;
  b2bB2c: string | null;
  tractionHighlights: string | null;
  problem: string | null;
  solution: string | null;
  differentiation: string | null;
  founders: string | null;
  roundType: string | null;
  targetAmount: string | null;
  valuation: string | null;
  revenue: string | null;
  growth: string | null;
  users: string | null;
}

interface DealRoom {
  id: string;
  name: string;
  description: string | null;
  visibilityConfigs: { visibleFields: string }[];
  startups: { startup: Startup }[];
}

export default function InvestorDealRoom() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [dealRoom, setDealRoom] = useState<DealRoom | null>(null);
  const [filter, setFilter] = useState({ sector: '', stage: '' });
  const [interests, setInterests] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'INVESTOR') {
      router.push('/unauthorized');
    } else if (session?.user?.role === 'INVESTOR') {
      fetchDealRoom();
      fetchInterests();
    }
  }, [session, status, router, params.id]);

  const fetchDealRoom = async () => {
    const res = await fetch(`/api/dealrooms/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setDealRoom(data);
    }
  };

  const fetchInterests = async () => {
    const res = await fetch('/api/intros');
    if (res.ok) {
      const data = await res.json();
      const interestMap: Record<string, string> = {};
      data.forEach((i: any) => {
        if (i.startupId) interestMap[i.startupId] = i.status;
      });
      setInterests(interestMap);
    }
  };

  const requestIntro = async (startupId: string) => {
    const res = await fetch('/api/intros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startupId,
        dealRoomId: params.id,
        note: 'I would like to learn more about this startup.',
      }),
    });

    if (res.ok) {
      fetchInterests();
    }
  };

  const defaultFields = [
    'companyName', 'website', 'stage', 'sector',
    'tractionHighlights', 'problem', 'solution', 'founders', 'targetAmount',
  ];

  const getVisibleFields = () => {
    if (!dealRoom?.visibilityConfigs[0]) return defaultFields;
    try {
      return JSON.parse(dealRoom.visibilityConfigs[0].visibleFields);
    } catch { return defaultFields; }
  };

  const visibleFields = getVisibleFields();

  const filteredStartups = dealRoom?.startups
    .map((s) => s.startup)
    .filter((s) => {
      if (filter.sector && s.sector !== filter.sector) return false;
      if (filter.stage && s.stage !== filter.stage) return false;
      return true;
    }) || [];

  if (status === 'loading' || !dealRoom) {
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
              <Link href="/investor" className="flex items-center gap-2">
                <Logo size="sm" />
                  
                </div>
                <span className="text-white font-semibold">Capital Call</span>
                <span className="px-2 py-0.5 rounded text-xs bg-accent/20 text-accent">Investor</span>
              </Link>
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
          <Link href="/investor" className="btn-ghost text-dark-300 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{dealRoom.name}</h1>
            <p className="text-dark-400 mt-1">{dealRoom.description || 'Browse curated investment opportunities'}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
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

        {/* Startups Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStartups.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-dark-500">No startups in this deal room yet.</p>
            </div>
          ) : (
            filteredStartups.map((startup) => {
              const interestStatus = interests[startup.id];
              return (
                <div key={startup.id} className="card bg-dark-900/50 border-dark-800 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white">{startup.companyName}</h3>
                    <span className="badge bg-primary-500/10 text-primary-400 border border-primary-500/20">
                      {startup.stage || 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    {startup.sector && (
                      <p className="text-dark-400"><span className="text-dark-500">Sector:</span> {startup.sector}</p>
                    )}
                    {startup.targetAmount && (
                      <p className="text-dark-400"><span className="text-dark-500">Target:</span> {startup.targetAmount}</p>
                    )}
                    {startup.tractionHighlights && (
                      <p className="text-dark-400 line-clamp-2">{startup.tractionHighlights}</p>
                    )}
                  </div>

                  {interestStatus ? (
                    <span className={`badge w-full justify-center ${
                      interestStatus === 'APPROVED'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : interestStatus === 'REQUESTED'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {interestStatus === 'APPROVED' ? '✓ Intro Approved' :
                       interestStatus === 'REQUESTED' ? '⏳ Intro Requested' : '✕ Intro Declined'}
                    </span>
                  ) : (
                    <button
                      onClick={() => requestIntro(startup.id)}
                      className="btn-primary w-full"
                    >
                      Request Intro
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
