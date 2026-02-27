'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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

  const getVisibleFields = () => {
    if (!dealRoom?.visibilityConfigs[0]) {
      return defaultFields;
    }
    try {
      return JSON.parse(dealRoom.visibilityConfigs[0].visibleFields);
    } catch {
      return defaultFields;
    }
  };

  const defaultFields = [
    'companyName',
    'website',
    'hq',
    'stage',
    'sector',
    'tractionHighlights',
    'problem',
    'solution',
    'differentiation',
    'founders',
    'roundType',
    'targetAmount',
  ];

  const visibleFields = getVisibleFields();

  const filteredStartups = dealRoom?.startups
    .map((s) => s.startup)
    .filter((s) => {
      if (filter.sector && s.sector !== filter.sector) return false;
      if (filter.stage && s.stage !== filter.stage) return false;
      return true;
    }) || [];

  if (status === 'loading' || !dealRoom) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/investor" className="text-gray-600 hover:text-gray-900">
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

        {/* Filters */}
        <div className="flex gap-4 mb-6">
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

        {/* Startups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStartups.map((startup) => {
            const interestStatus = interests[startup.id];
            return (
              <div key={startup.id} className="bg-white p-6 rounded-xl border">
                <h3 className="font-semibold text-lg text-gray-900">
                  {startup.companyName}
                </h3>
                <p className="text-gray-600 text-sm">
                  {startup.stage} • {startup.sector}
                </p>

                {visibleFields.includes('tractionHighlights') && startup.tractionHighlights && (
                  <p className="text-gray-600 text-sm mt-3">{startup.tractionHighlights}</p>
                )}

                {visibleFields.includes('problem') && startup.problem && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 uppercase">Problem</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{startup.problem}</p>
                  </div>
                )}

                {visibleFields.includes('solution') && startup.solution && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500 uppercase">Solution</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{startup.solution}</p>
                  </div>
                )}

                {visibleFields.includes('targetAmount') && startup.targetAmount && (
                  <p className="text-sm text-gray-600 mt-3">
                    Target: {startup.targetAmount}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t flex gap-2">
                  {interestStatus ? (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        interestStatus === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {interestStatus}
                    </span>
                  ) : (
                    <button
                      onClick={() => requestIntro(startup.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg text-sm"
                    >
                      Request Intro
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredStartups.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No startups found in this deal room.
          </div>
        )}
      </div>
    </div>
  );
}
