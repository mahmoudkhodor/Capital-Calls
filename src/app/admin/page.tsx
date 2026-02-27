import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const startups = await prisma.startup.findMany({
    include: {
      ownerUser: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const dealRooms = await prisma.dealRoom.findMany({
    include: {
      _count: {
        select: { startups: true, investors: true },
      },
    },
  });

  const pendingIntros = await prisma.interest.findMany({
    where: { status: 'REQUESTED' },
    include: {
      investor: { select: { name: true, email: true } },
      startup: { select: { companyName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalInvestors = await prisma.user.count({
    where: { role: 'INVESTOR' },
  });

  const statusCounts = {
    submitted: startups.filter((s) => s.status === 'SUBMITTED').length + (await prisma.startup.count({ where: { status: 'SUBMITTED' } })) - startups.length,
    inReview: startups.filter((s) => s.status === 'IN_REVIEW').length + (await prisma.startup.count({ where: { status: 'IN_REVIEW' } })) - startups.length,
    shortlisted: startups.filter((s) => s.status === 'SHORTLISTED').length + (await prisma.startup.count({ where: { status: 'SHORTLISTED' } })) - startups.length,
    notMoving: startups.filter((s) => s.status === 'NOT_MOVING_FORWARD').length + (await prisma.startup.count({ where: { status: 'NOT_MOVING_FORWARD' } })) - startups.length,
  };

  const allStartups = await prisma.startup.findMany({ select: { status: true } });
  const allStatusCounts = {
    submitted: allStartups.filter((s) => s.status === 'SUBMITTED').length,
    inReview: allStartups.filter((s) => s.status === 'IN_REVIEW').length,
    shortlisted: allStartups.filter((s) => s.status === 'SHORTLISTED').length,
    notMoving: allStartups.filter((s) => s.status === 'NOT_MOVING_FORWARD').length,
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="border-b border-white/5 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <Logo size="sm" />
                <span className="text-white font-semibold">Capital Call</span>
                <span className="px-2 py-0.5 rounded text-xs bg-primary-500/20 text-primary-400">Admin</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/admin" className="text-white font-medium">Dashboard</Link>
                <Link href="/admin/analytics" className="text-dark-400 hover:text-white transition-colors">Analytics</Link>
                <Link href="/admin/pipeline" className="text-dark-400 hover:text-white transition-colors">Pipeline</Link>
                <Link href="/admin/startups" className="text-dark-400 hover:text-white transition-colors">Startups</Link>
                <Link href="/admin/dealrooms" className="text-dark-400 hover:text-white transition-colors">Deal Rooms</Link>
                <Link href="/admin/intros" className="text-dark-400 hover:text-white transition-colors">Intros</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm text-white">{session.user.name || session.user.email}</div>
                <div className="text-xs text-dark-500">Administrator</div>
              </div>
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
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-dark-400 mt-1">Here's what's happening with your dealroom today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-6 bg-dark-900/50 border-dark-800 animate-fade-in" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{allStartups.length}</div>
                <div className="text-dark-400 text-sm">Total Applications</div>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-dark-900/50 border-dark-800 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{allStatusCounts.submitted}</div>
                <div className="text-dark-400 text-sm">Submitted</div>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-dark-900/50 border-dark-800 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{allStatusCounts.shortlisted}</div>
                <div className="text-dark-400 text-sm">Shortlisted</div>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-dark-900/50 border-dark-800 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalInvestors}</div>
                <div className="text-dark-400 text-sm">Active Investors</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { href: '/admin/analytics', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ), title: 'Analytics', desc: 'Stats & metrics', color: 'cyan' },
            { href: '/admin/pipeline', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            ), title: 'Pipeline', desc: 'Kanban view', color: 'indigo' },
            { href: '/admin/startups', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ), title: 'Startups', desc: 'Manage apps', color: 'blue' },
            { href: '/admin/dealrooms', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            ), title: 'Deal Rooms', desc: 'Investor lists', color: 'green' },
            { href: '/admin/intros', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ), title: 'Intros', desc: `${pendingIntros.length} pending`, color: 'purple' },
          ].map((action, i) => (
            <Link
              key={action.href}
              href={action.href}
              className={`card p-5 group hover:border-${action.color}-500/30 transition-all duration-300 animate-slide-up`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`w-10 h-10 rounded-lg bg-${action.color}-500/10 flex items-center justify-center text-${action.color}-500 mb-3 group-hover:bg-${action.color}-500 group-hover:text-white transition-all duration-300`}>
                {action.icon}
              </div>
              <div className="font-semibold text-white">{action.title}</div>
              <div className="text-dark-500 text-sm">{action.desc}</div>
            </Link>
          ))}
        </div>

        {/* Recent Applications */}
        <div className="card bg-dark-900/50 border-dark-800 overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="p-6 border-b border-dark-800 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
            <Link href="/admin/startups" className="text-primary-500 hover:text-primary-400 text-sm font-medium transition-colors">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">Sector</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {startups.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-dark-500">
                      No applications yet
                    </td>
                  </tr>
                ) : (
                  startups.map((startup) => (
                    <tr key={startup.id} className="hover:bg-dark-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{startup.companyName}</div>
                        <div className="text-sm text-dark-500">{startup.ownerUser.email}</div>
                      </td>
                      <td className="px-6 py-4 text-dark-400">{startup.stage || '-'}</td>
                      <td className="px-6 py-4 text-dark-400">{startup.sector || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          startup.status === 'SHORTLISTED'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : startup.status === 'SUBMITTED'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : startup.status === 'IN_REVIEW'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-dark-700 text-dark-400 border border-dark-600'
                        }`}>
                          {startup.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-400">{startup.score || '-'}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/startups/${startup.id}`}
                          className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
