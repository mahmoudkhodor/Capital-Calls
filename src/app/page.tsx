import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Logo from '@/components/Logo';
import PsychedelicBackground from '@/components/landing/PsychedelicBackground';
import FloatingShapes from '@/components/landing/FloatingShapes';
import ScrollReveal from '@/components/landing/ScrollReveal';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    const role = session.user.role;
    if (role === 'ADMIN') redirect('/admin');
    if (role === 'STARTUP') redirect('/startup');
    if (role === 'INVESTOR') redirect('/investor');
  }

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-x-hidden">
      {/* 3D Psychedelic Background */}
      <PsychedelicBackground />

      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 backdrop-blur-md bg-dark-950/30">
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Logo size="md" />
                <div className="absolute inset-0 bg-neon-pink/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <span className="text-xl font-bold text-white group-hover:neon-text transition-all duration-300">
                Capital Call
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-5 py-2 text-white/80 hover:text-white transition-all duration-300 hover:neon-text"
              >
                Sign In
              </Link>
              <Link
                href="/apply"
                className="relative px-6 py-3 text-white font-semibold overflow-hidden rounded-full group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="absolute inset-0 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="relative">Apply Now</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] flex items-center justify-center">
        <div className="container-custom text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-10">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-white/80">The future of startup fundraising</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 tracking-tight leading-tight">
              <span className="block animate-float bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan bg-clip-text text-transparent bg-[length:200%_200%] animate-[wave_3s_ease-in-out_infinite]">
                Where
              </span>
              <span className="block animate-float bg-gradient-to-r from-neon-cyan via-neon-green to-neon-yellow bg-clip-text text-transparent" style={{ animationDelay: '0.5s' }}>
                Visionary
              </span>
              <span className="block animate-float bg-gradient-to-r from-neon-yellow via-neon-orange to-neon-pink bg-clip-text text-transparent" style={{ animationDelay: '1s' }}>
                Founders
              </span>
              <span className="block mt-4 text-4xl md:text-6xl">
                Meet Their <span className="neon-text text-neon-purple">Investors</span>
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with the right investors through our curated dealroom platform.
              Every connection is meaningful, every deal is crafted for success.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/apply"
                className="group relative px-10 py-5 text-lg font-bold text-white overflow-hidden rounded-full"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-neon-pink to-neon-purple" />
                <span className="absolute inset-0 bg-gradient-to-r from-neon-pink to-neon-purple blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative">Apply as Startup</span>
              </Link>
              <Link
                href="/login"
                className="px-10 py-5 text-lg font-medium text-white border border-white/20 rounded-full hover:border-neon-cyan hover:text-neon-cyan transition-all duration-300 backdrop-blur-sm"
              >
                Investor Login
              </Link>
            </div>
          </ScrollReveal>

          {/* Floating shapes in hero */}
          <FloatingShapes className="opacity-30" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32">
        <div className="container-custom">
          <ScrollReveal>
            <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-20">
              Everything You <span className="neon-text text-neon-pink">Need</span>
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'For Founders',
                description: 'Apply in minutes, not hours. Track your application status in real-time and connect directly with investors who align with your vision.',
                color: 'neon-pink',
              },
              {
                icon: '📊',
                title: 'For Investors',
                description: 'Access curated opportunities, discover hidden gems, and make data-driven investment decisions with our intelligent matching system.',
                color: 'neon-cyan',
              },
              {
                icon: '🌟',
                title: 'Community',
                description: 'Join a network of founders and investors who trust Capital Call to facilitate meaningful connections that drive innovation.',
                color: 'neon-green',
              },
            ].map((feature, i) => (
              <ScrollReveal key={i} delay={i * 0.15} direction={i % 2 === 0 ? 'left' : 'right'}>
                <div className="group glass-neon p-8 rounded-2xl hover:scale-105 transition-all duration-500 cursor-pointer">
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 bg-${feature.color}/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className={`relative w-16 h-16 rounded-xl bg-${feature.color}/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className={`text-2xl font-semibold text-${feature.color} mb-4 group-hover:neon-text transition-all duration-300`}>
                    {feature.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-32">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '$2B+', label: 'Capital Deployed', color: 'neon-pink' },
              { value: '500+', label: 'Startups Funded', color: 'neon-purple' },
              { value: '200+', label: 'Active Investors', color: 'neon-cyan' },
              { value: '95%', label: 'Match Rate', color: 'neon-green' },
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-center group">
                  <div className={`text-5xl md:text-7xl font-bold text-${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-lg">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="container-custom">
          <ScrollReveal>
            <div className="relative p-12 md:p-20 text-center rounded-3xl overflow-hidden">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/20 via-neon-purple/20 to-neon-cyan/20 animate-pulse-slow" />
              <div className="absolute inset-0 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

              {/* Animated border */}
              <div className="absolute inset-0 rounded-3xl animate-morph">
                <div className="absolute inset-0 rounded-3xl border-2 border-neon-pink/50" />
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  Ready to <span className="neon-text text-neon-pink">Get Started?</span>
                </h2>
                <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
                  Join hundreds of startups and investors already using Capital Call to close their next big deal.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link
                    href="/apply"
                    className="group relative px-12 py-6 text-xl font-bold text-white overflow-hidden rounded-full"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-neon-green to-neon-cyan" />
                    <span className="absolute inset-0 bg-gradient-to-r from-neon-green to-neon-cyan blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-pink opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative">Apply as Startup</span>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/10">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="text-white font-medium">Capital Call</span>
            </div>
            <p className="text-white/40 text-sm">
              © 2026 Capital Call. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
