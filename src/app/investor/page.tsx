import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function InvestorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'INVESTOR') {
    redirect('/login');
  }

  // Get investor's deal rooms
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

  // Get investor's interests
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Investor Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl font-bold text-blue-600">{dealRooms.length}</div>
            <div className="text-gray-600">Deal Rooms</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl font-bold text-yellow-600">
              {pendingIntros.length}
            </div>
            <div className="text-gray-600">Pending Intros</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl font-bold text-green-600">
              {approvedIntros.length}
            </div>
            <div className="text-gray-600">Approved Intros</div>
          </div>
        </div>

        {/* Deal Rooms */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Your Deal Rooms</h2>
          </div>
          {dealRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {dealRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/investor/dealrooms/${room.id}`}
                  className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition"
                >
                  <h3 className="font-semibold text-gray-900">{room.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {room.description || 'No description'}
                  </p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span>{room._count.startups} startups</span>
                    <span>{room._count.investors} investors</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              You haven&apos;t been added to any deal rooms yet.
            </div>
          )}
        </div>

        {/* Your Interests */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Your Interests</h2>
          </div>
          {interests.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Startup
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Deal Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {interests.map((interest) => (
                  <tr key={interest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {interest.startup.companyName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {interest.startup.stage} • {interest.startup.sector}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {interest.dealRoom?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          interest.status === 'APPROVED' || interest.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : interest.status === 'REQUESTED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : interest.status === 'DECLINED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {interest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(interest.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              You haven&apos;t expressed interest in any startups yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
