import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No startup found</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    IN_REVIEW: 'bg-blue-100 text-blue-800',
    FOLLOW_UP: 'bg-orange-100 text-orange-800',
    SHORTLISTED: 'bg-green-100 text-green-800',
    NOT_MOVING_FORWARD: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Startup Dashboard</h1>
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
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {startup.companyName}
              </h2>
              <p className="text-gray-600">{startup.website || 'No website'}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                statusColors[startup.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {startup.status.replace('_', ' ')}
            </span>
          </div>

          {startup.score && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Your Score:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {startup.score}/100
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-gray-600 mb-2">Stage</div>
            <div className="text-xl font-semibold">{startup.stage || 'Not specified'}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-gray-600 mb-2">Sector</div>
            <div className="text-xl font-semibold">{startup.sector || 'Not specified'}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-gray-600 mb-2">Target Amount</div>
            <div className="text-xl font-semibold">{startup.targetAmount || 'Not specified'}</div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Documents</h2>
            <Link
              href="/startup/upload"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Upload Document
            </Link>
          </div>
          <div className="p-6">
            {startup.documents.length > 0 ? (
              <ul className="space-y-3">
                {startup.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">📄</span>
                      <span className="font-medium">{doc.filename}</span>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No documents uploaded yet.</p>
            )}
          </div>
        </div>

        {/* Application Summary */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Application Summary</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Problem</h3>
              <p className="text-gray-600">{startup.problem || 'Not provided'}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Solution</h3>
              <p className="text-gray-600">{startup.solution || 'Not provided'}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Traction</h3>
              <p className="text-gray-600">
                {startup.tractionHighlights || 'Not provided'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Team</h3>
              <p className="text-gray-600">{startup.founders || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
