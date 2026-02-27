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
    <div className="min-h-screen bg-dark-950">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 backdrop-blur-sm bg-dark-950/50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-white">Capital Call</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="btn-ghost text-white/80 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/apply"
                className="btn-primary"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 section-padding">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              Trusted by leading investors
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-up tracking-tight">
              Where <span className="gradient-text">Startups</span> Meet
              <br />
              Their Investors
            </h1>

            <p className="text-xl text-dark-400 mb-10 max-w-2xl mx-auto animate-slide-up animation-delay-100">
              The premier dealroom platform connecting visionary founders with strategic investors.
              Streamlined, elegant, and built for deals that matter.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-200">
              <Link href="/apply" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                Apply as Startup
              </Link>
              <Link href="/login" className="btn-secondary bg-white/5 border-white/10 text-white hover:bg-white/10 w-full sm:w-auto">
                Investor Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-dark-900/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Fundraise
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              From application to investment, we've built the tools that make the difference between good deals and great ones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "For Startups",
                description: "Submit your application, upload your pitch deck, and track your status in real-time. Get discovered by quality investors.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "For Investors",
                description: "Access curated deal rooms, express interest, and request introductions to promising startups that match your thesis.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                ),
                title: "Admin Control",
                description: "Manage applications, create deal rooms, control visibility, and facilitate introductions with powerful admin tools.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="card p-8 group hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-500"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 mb-6 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-dark-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "$2B+", label: "Capital Deployed" },
              { value: "500+", label: "Startups Funded" },
              { value: "200+", label: "Active Investors" },
              { value: "95%", label: "Match Rate" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-dark-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 section-padding">
        <div className="container-custom">
          <div className="gradient-border p-12 md:p-16 text-center relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary-500 to-accent rounded-full" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-dark-400 max-w-xl mx-auto mb-8">
                Join hundreds of startups and investors already using Capital Call to close their next big deal.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/apply" className="btn-primary w-full sm:w-auto pulse-glow">
                  Apply as Startup
                </Link>
                <Link href="/login" className="btn-ghost text-white w-full sm:w-auto">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/5">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-white font-medium">Capital Call</span>
            </div>
            <p className="text-dark-500 text-sm">
              © 2026 Capital Call. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
