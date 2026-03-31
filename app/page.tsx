import Link from 'next/link'
import HomepageStats from '@/components/HomepageStats'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0A0A0A' }}>
      {/* Navbar */}
      <nav style={{ background: '#0A0A0A', borderBottom: '1px solid #1a1a1a' }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-bold tracking-tight" style={{ color: '#C41E3A' }}>Nomadic</span>
            <span className="text-xl font-bold tracking-tight text-white">Match</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/register" className="text-sm font-semibold px-5 py-2 rounded-full transition-all" style={{ background: '#C41E3A', color: 'white' }}>
              Join Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-20 pb-12 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(196,30,58,0.15) 0%, transparent 70%)'
        }} />

        <div className="relative max-w-4xl mx-auto">
          {/* Live chip */}
          <HomepageStats />

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 text-white mt-8">
            Find Your Match.
          </h1>
          <p className="text-xl sm:text-2xl leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
            The only dating site built for digital nomads.<br />
            Browse by location. Match by values.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="text-base font-bold px-10 py-4 rounded-full transition-all hover:scale-105" style={{ background: '#C41E3A', color: 'white', boxShadow: '0 0 40px rgba(196,30,58,0.4)' }}>
              Claim Your Free Spot →
            </Link>
            <Link href="/login" className="text-base font-medium px-10 py-4 rounded-full transition-all" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
              Sign In
            </Link>
          </div>

          <p className="mt-5 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            First 100 members free forever · After that, $24/year
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4" style={{ borderTop: '1px solid #1a1a1a' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#C41E3A' }}>How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-14 text-white">
            Three steps to find your nomad.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Sign Up',
                desc: 'Create your account in 60 seconds. First 100 members get in free.',
                icon: '✈️',
              },
              {
                num: '02',
                title: 'Build Your Profile',
                desc: 'Share your travel style, current location, future plans, and what you\'re looking for.',
                icon: '🌍',
              },
              {
                num: '03',
                title: 'Find Your Match',
                desc: 'Browse nomads who match your values, travel pace, and relationship goals.',
                icon: '❤️',
              },
            ].map((item) => (
              <div key={item.num} className="rounded-2xl p-8 text-left" style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                <div className="text-3xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#C41E3A' }}>
                  Step {item.num}
                </div>
                <h3 className="text-lg font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 text-center" style={{ borderTop: '1px solid #1a1a1a' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Your next adventure starts here.
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Don't miss your free spot. Only 100 available.
          </p>
          <Link href="/register" className="inline-block text-base font-bold px-12 py-4 rounded-full transition-all hover:scale-105" style={{ background: '#C41E3A', color: 'white', boxShadow: '0 0 40px rgba(196,30,58,0.4)' }}>
            Claim Your Free Spot →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm" style={{ borderTop: '1px solid #1a1a1a', color: 'rgba(255,255,255,0.2)' }}>
        © {new Date().getFullYear()} NomadicMatch. All rights reserved.
      </footer>
    </div>
  )
}
