'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Startup {
  id: string;
  companyName: string;
  website: string | null;
  hq: string | null;
  incorporationCountry: string | null;
  stage: string | null;
  sector: string | null;
  b2bB2c: string | null;
  tractionHighlights: string | null;
  founders: string | null;
  teamRoles: string | null;
  linkedin: string | null;
  problem: string | null;
  solution: string | null;
  differentiation: string | null;
  moat: string | null;
  revenue: string | null;
  growth: string | null;
  users: string | null;
  retention: string | null;
  cac: string | null;
  ltv: string | null;
  roundType: string | null;
  targetAmount: string | null;
  valuation: string | null;
  useOfFunds: string | null;
  status: string;
  score: number | null;
  teamScore: number | null;
  marketScore: number | null;
  tractionScore: number | null;
  productScore: number | null;
  tags: string[];
  adminNotes: string | null;
  documents: { id: string; type: string; filename: string; url: string }[];
}

export default function AdminStartupDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [scores, setScores] = useState({
    teamScore: 0,
    marketScore: 0,
    tractionScore: 0,
    productScore: 0,
  });
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/unauthorized');
    } else if (session?.user?.role === 'ADMIN') {
      fetchStartup();
    }
  }, [session, status, router, params.id]);

  const fetchStartup = async () => {
    const res = await fetch(`/api/startups/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setStartup(data);
      if (data.teamScore) setScores({ teamScore: data.teamScore, marketScore: data.marketScore || 0, tractionScore: data.tractionScore || 0, productScore: data.productScore || 0 });
      if (data.adminNotes) setNotes(data.adminNotes);
    }
  };

  const saveScores = async () => {
    if (!startup) return;
    setSaving(true);

    const totalScore = Math.round(
      (scores.teamScore + scores.marketScore + scores.tractionScore + scores.productScore) / 4
    );

    const res = await fetch('/api/startups', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: startup.id,
        ...scores,
        score: totalScore,
        adminNotes: notes,
      }),
    });

    setSaving(false);
    if (res.ok) {
      fetchStartup();
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    IN_REVIEW: 'bg-blue-100 text-blue-800',
    FOLLOW_UP: 'bg-orange-100 text-orange-800',
    SHORTLISTED: 'bg-green-100 text-green-800',
    NOT_MOVING_FORWARD: 'bg-red-100 text-red-800',
  };

  if (status === 'loading' || !startup) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/startups" className="text-gray-600 hover:text-gray-900">
              &larr; Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{startup.companyName}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[startup.status]}`}>
            {startup.status.replace('_', ' ')}
          </span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Info */}
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="text-lg font-semibold mb-4">Company Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Website:</span>
                  <span className="ml-2">{startup.website || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">HQ:</span>
                  <span className="ml-2">{startup.hq || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Country:</span>
                  <span className="ml-2">{startup.incorporationCountry || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Stage:</span>
                  <span className="ml-2">{startup.stage || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Sector:</span>
                  <span className="ml-2">{startup.sector || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">B2B/B2C:</span>
                  <span className="ml-2">{startup.b2bB2c || '-'}</span>
                </div>
              </div>
              {startup.tractionHighlights && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Traction</h3>
                  <p className="text-sm">{startup.tractionHighlights}</p>
                </div>
              )}
            </div>

            {/* Product */}
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="text-lg font-semibold mb-4">Product</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="text-gray-500">Problem</h3>
                  <p>{startup.problem || '-'}</p>
                </div>
                <div>
                  <h3 className="text-gray-500">Solution</h3>
                  <p>{startup.solution || '-'}</p>
                </div>
                <div>
                  <h3 className="text-gray-500">Differentiation</h3>
                  <p>{startup.differentiation || '-'}</p>
                </div>
                <div>
                  <h3 className="text-gray-500">Moat</h3>
                  <p>{startup.moat || '-'}</p>
                </div>
              </div>
            </div>

            {/* Team */}
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="text-lg font-semibold mb-4">Team</h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Founders:</span> {startup.founders || '-'}</p>
                <p><span className="text-gray-500">Roles:</span> {startup.teamRoles || '-'}</p>
                {startup.linkedin && (
                  <a href={startup.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    LinkedIn Profile
                  </a>
                )}
              </div>
            </div>

            {/* Fundraising */}
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="text-lg font-semibold mb-4">Fundraising</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Round:</span>
                  <span className="ml-2">{startup.roundType || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Target:</span>
                  <span className="ml-2">{startup.targetAmount || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Valuation:</span>
                  <span className="ml-2">{startup.valuation || '-'}</span>
                </div>
              </div>
              {startup.useOfFunds && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Use of Funds</h3>
                  <p className="text-sm">{startup.useOfFunds}</p>
                </div>
              )}
            </div>

            {/* Documents */}
            {startup.documents.length > 0 && (
              <div className="bg-white p-6 rounded-xl border">
                <h2 className="text-lg font-semibold mb-4">Documents</h2>
                <ul className="space-y-2">
                  {startup.documents.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>{doc.filename}</span>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        View
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar - Scoring */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="text-lg font-semibold mb-4">Score (0-100)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Team</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scores.teamScore}
                    onChange={(e) => setScores({ ...scores, teamScore: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <span className="text-sm">{scores.teamScore}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Market</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scores.marketScore}
                    onChange={(e) => setScores({ ...scores, marketScore: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <span className="text-sm">{scores.marketScore}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Traction</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scores.tractionScore}
                    onChange={(e) => setScores({ ...scores, tractionScore: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <span className="text-sm">{scores.tractionScore}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Product</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scores.productScore}
                    onChange={(e) => setScores({ ...scores, productScore: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <span className="text-sm">{scores.productScore}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Score:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {Math.round((scores.teamScore + scores.marketScore + scores.tractionScore + scores.productScore) / 4)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={saveScores}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg"
                >
                  {saving ? 'Saving...' : 'Save Scores'}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <h2 className="text-lg font-semibold mb-4">Admin Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border rounded-lg p-3 text-sm"
                rows={6}
                placeholder="Internal notes..."
              />
              <button
                onClick={saveScores}
                disabled={saving}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg"
              >
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
