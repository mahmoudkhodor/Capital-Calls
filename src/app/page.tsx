import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    const role = session.user.role;
    if (role === 'ADMIN') redirect('/admin');
    if (role === 'STARTUP') redirect('/startup');
    if (role === 'INVESTOR') redirect('/investor');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold text-white">Capital Call</h1>
          <div className="space-x-4">
            <Link
              href="/login"
              className="text-white hover:text-blue-300 transition"
            >
              Sign In
            </Link>
            <Link
              href="/apply"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Apply Now
            </Link>
          </div>
        </nav>

        <div className="text-center py-20">
          <h2 className="text-5xl font-bold text-white mb-6">
            Connect Startups with Investors
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            A platform where startups apply, get reviewed, and gain access to
            curated deal rooms. Investors discover quality opportunities.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="/apply"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition"
            >
              Apply as Startup
            </Link>
            <Link
              href="/login"
              className="bg-transparent border-2 border-white hover:bg-white/10 text-white px-8 py-4 rounded-lg text-lg font-semibold transition"
            >
              Investor Login
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">For Startups</h3>
            <p className="text-gray-400">
              Submit your application, upload your pitch deck, and track your
              status in real-time.
            </p>
          </div>
          <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">For Investors</h3>
            <p className="text-gray-400">
              Access curated deal rooms, express interest, and request
              introductions to promising startups.
            </p>
          </div>
          <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">Admin Control</h3>
            <p className="text-gray-400">
              Manage applications, create deal rooms, control visibility, and
              facilitate intros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
