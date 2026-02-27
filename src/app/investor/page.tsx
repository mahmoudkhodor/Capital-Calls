import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default async function InvestorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'INVESTOR') {
    redirect('/login');
  }

  const dealRooms = await prisma.dealRoom.findMany({
    where: {
      investors: {
        some: { investorUserId: session.user.id },
      },
    },
    include: {
      startups: {
        include: {
          startup: true,
        },
      },
      _count: {
        select: { startups: true, investors: true },
      },
    },
  });

  const interests = await prisma.interest.findMany({
    where: { investorId: session.user.id },
    include: {
      startup: { select: { companyName: true, stage: true, sector: true } },
      dealRoom: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const pendingIntros = interests.filter((i) => i.status === 'REQUESTED');
  const approvedIntros = interests.filter(
    (i) => i.status === 'APPROVED' || i.status === 'COMPLETED'
  );

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
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-dark-400 mt-1">Browse deal rooms and track your interests.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-6 bg-dark-900/50 border-dark-800 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{dealRooms.length}</div>
                <div className="text-dark-400 text-sm">Deal Rooms</div>
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
                <div className="text-2xl font-bold text-white">{pendingIntros.length}</div>
                <div className="text-dark-400 text-sm">Pending Intros</div>
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
                <div className="text-2xl font-bold text-white">{approvedIntros.length}</div>
                <div className="text-dark-400 text-sm">Approved Intros</div>
              </div>
            </div>
          </div>
        </div>

        {/* Deal Rooms */}
        <div className="card bg-dark-900/50 border-dark-800 overflow-hidden mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="p-6 border-b border-dark-800">
            <h2 className="text-xl font-semibold text-white">Your Deal Rooms</h2>
          </div>
          {dealRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {dealRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/investor/dealrooms/${room.id}`}
                  className="p-5 border border-dark-700 rounded-xl hover:border-primary-500/30 hover:bg-dark-800/30 transition-all duration-300"
                >
                  <h3 className="font-semibold text-white text-lg">{room.name}</h3>
                  <p className="text-dark-400 text-sm mt-1 mb-4">
                    {room.description || 'No description'}
                  </p>
                  <div className="flex gap-6 text-sm">
                    <span className="text-dark-500">
                      <span className="text-white font-medium">{room._count.startups}</span> startups
                    </span>
                    <span className="text-dark-500">
                      <span className="text-white font-medium">{room._count.investors}</span> investors
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-dark-400">You haven't been added to any deal rooms yet.</p>
              <p className="text-dark-500 text-sm mt-1">Contact an admin to get access to deal rooms.</p>
            </div>
          )}
        </div>

        {/* Your Interests */}
        <div className="card bg-dark-900/50 border-dark-800 overflow-hidden animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="p-6 border-b border-dark-800">
            <h2 className="text-xl font-semibold text-white">Your Interests</h2>
          </div>
          {interests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">Startup</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">Deal Room</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {interests.map((interest) => (
                    <tr key={interest.id} className="hover:bg-dark-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{interest.startup.companyName}</div>
                        <div className="text-sm text-dark-500">
                          {interest.startup.stage} • {interest.startup.sector}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-dark-400">{interest.dealRoom?.name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          interest.status === 'APPROVED' || interest.status === 'COMPLETED'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : interest.status === 'REQUESTED'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : interest.status === 'DECLINED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {interest.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-400">
                        {new Date(interest.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-dark-400">You haven't expressed interest in any startups yet.</p>
              <p className="text-dark-500 text-sm mt-1">Join deal rooms to discover startups.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
