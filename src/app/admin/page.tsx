import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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

  const statusCounts = {
    submitted: startups.filter((s) => s.status === 'SUBMITTED').length,
    inReview: startups.filter((s) => s.status === 'IN_REVIEW').length,
    shortlisted: startups.filter((s) => s.status === 'SHORTLISTED').length,
    notMoving: startups.filter((s) => s.status === 'NOT_MOVING_FORWARD').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{session.user.email}</span>
            <Link
              href="/api/auth/signout"
              className="text-blue-600 hover:text-blue-700"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl font-bold text-blue-600">{startups.length}</div>
            <div className="text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl font-bold text-yellow-600">
              {statusCounts.submitted}
            </div>
            <div className="text-gray-600">Submitted</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl font-bold text-green-600">
              {statusCounts.shortlisted}
            </div>
            <div className="text-gray-600">Shortlisted</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl font-bold text-purple-600">{dealRooms.length}</div>
            <div className="text-gray-600">Deal Rooms</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Link
            href="/admin/analytics"
            className="bg-cyan-600 hover:bg-cyan-700 text-white p-6 rounded-xl text-center"
          >
            <div className="text-xl font-semibold">Analytics</div>
            <div className="text-cyan-200">Stats & metrics</div>
          </Link>
          <Link
            href="/admin/pipeline"
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-xl text-center"
          >
            <div className="text-xl font-semibold">Pipeline</div>
            <div className="text-indigo-200">Kanban board view</div>
          </Link>
          <Link
            href="/admin/startups"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl text-center"
          >
            <div className="text-xl font-semibold">All Startups</div>
            <div className="text-blue-200">View & manage applications</div>
          </Link>
          <Link
            href="/admin/dealrooms"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl text-center"
          >
            <div className="text-xl font-semibold">Deal Rooms</div>
            <div className="text-green-200">Create & manage investor lists</div>
          </Link>
          <Link
            href="/admin/intros"
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl text-center"
          >
            <div className="text-xl font-semibold">Intros</div>
            <div className="text-purple-200">Review pending requests ({pendingIntros.length})</div>
          </Link>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
          </div>
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
              {startups.slice(0, 10).map((startup) => (
                <tr key={startup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {startup.companyName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {startup.ownerUser.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{startup.stage || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{startup.sector || '-'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        startup.status === 'SHORTLISTED'
                          ? 'bg-green-100 text-green-800'
                          : startup.status === 'SUBMITTED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : startup.status === 'IN_REVIEW'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {startup.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {startup.score || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/startups/${startup.id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
