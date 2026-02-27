import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default async function StartupDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'STARTUP') {
    redirect('/login');
  }

  const startup = await prisma.startup.findUnique({
    where: { ownerUserId: session.user.id },
    include: { documents: true },
  });

  if (!startup) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="card p-8 text-center">
          <p className="text-dark-400">No startup found</p>
          <Link href="/apply" className="btn-primary mt-4 inline-block">
            Apply Now
          </Link>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-dark-700 text-dark-300 border-dark-600',
    SUBMITTED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    IN_REVIEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    FOLLOW_UP: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    SHORTLISTED: 'bg-green-500/10 text-green-400 border-green-500/20',
    NOT_MOVING_FORWARD: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="border-b border-white/5 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/startup" className="flex items-center gap-2">
                <Logo size="sm" />
                <span className="text-white font-semibold">Capital Call</span>
                <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">Startup</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/api/auth/signout"
                className="btn-ghost text-dark-300 hover:text-white"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        {/* Welcome */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white">Welcome back, {startup.companyName}</h1>
          <p className="text-dark-400 mt-1">Track your application status and manage your documents.</p>
        </div>

        {/* Status Card */}
        <div className="card bg-dark-900/50 border-dark-800 p-6 mb-8 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">{startup.companyName}</h2>
              <p className="text-dark-400 mt-1">{startup.website || 'No website'}</p>
            </div>
            <span className={`badge border ${statusColors[startup.status] || statusColors.DRAFT} px-4 py-2`}>
              {startup.status.replace('_', ' ')}
            </span>
          </div>

          {startup.score && (
            <div className="pt-6 border-t border-dark-800">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-dark-400">Your Score</span>
                    <span className="text-white font-medium">{startup.score}/100</span>
                  </div>
                  <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent rounded-full transition-all duration-500"
                      style={{ width: `${startup.score}%` }}
                    />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white ml-4">{startup.score}</div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Stage', value: startup.stage || 'Not specified', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )},
            { label: 'Sector', value: startup.sector || 'Not specified', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            )},
            { label: 'Target Amount', value: startup.targetAmount || 'Not specified', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )},
          ].map((stat, i) => (
            <div key={stat.label} className="card p-5 bg-dark-900/50 border-dark-800 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-dark-400 text-sm">{stat.label}</div>
                  <div className="text-white font-semibold">{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Documents */}
        <div className="card bg-dark-900/50 border-dark-800 overflow-hidden mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="p-6 border-b border-dark-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Your Documents</h2>
            <Link href="/startup/upload" className="btn-primary text-sm">
              Upload Document
            </Link>
          </div>
          <div className="p-6">
            {startup.documents.length > 0 ? (
              <ul className="space-y-3">
                {startup.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg hover:bg-dark-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-white font-medium">{doc.filename}</span>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:text-primary-400 text-sm font-medium transition-colors"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-dark-400 mb-4">No documents uploaded yet.</p>
                <Link href="/startup/upload" className="btn-primary inline-block">
                  Upload Your First Document
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Application Summary */}
        <div className="card bg-dark-900/50 border-dark-800 overflow-hidden animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="p-6 border-b border-dark-800">
            <h2 className="text-xl font-semibold text-white">Application Summary</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Problem', value: startup.problem },
              { label: 'Solution', value: startup.solution },
              { label: 'Traction', value: startup.tractionHighlights },
              { label: 'Team', value: startup.founders },
            ].map((item) => (
              <div key={item.label}>
                <h3 className="text-dark-400 text-sm mb-2">{item.label}</h3>
                <p className="text-white">{item.value || 'Not provided'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
