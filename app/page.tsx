import Link from 'next/link'
import Image from 'next/image'
import HomepageStats from '@/components/HomepageStats'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--nm-white)' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--nm-black)' }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: 'var(--nm-red)' }}
            >
              Nomadic
            </span>
            <span className="text-xl font-bold tracking-tight text-white">Match</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-outline-white text-sm py-2 px-4">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
            style={{ background: '#FFE8EC', color: 'var(--nm-red)' }}
          >
            Dating for digital nomads
          </div>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6"
            style={{ color: 'var(--nm-black)' }}
          >
            Find Your Match.
          </h1>
          <p
            className="text-xl sm:text-2xl leading-relaxed mb-10 max-w-xl mx-auto"
            style={{ color: 'var(--nm-muted)' }}
          >
            Get instant access to our database of single digital nomads.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-base px-8 py-4">
              Join Now — $24/year
            </Link>
            <Link href="/login" className="btn-outline text-base px-8 py-4">
              Sign In
            </Link>
          </div>
          <p className="mt-5 text-sm" style={{ color: '#9B9B9B' }}>
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </section>

      {/* Stats / Just Joined */}
      <section className="py-16 px-4" style={{ background: 'var(--nm-gray)' }}>
        <div className="max-w-5xl mx-auto">
          <HomepageStats />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: 'var(--nm-black)' }}
          >
            How It Works
          </h2>
          <p className="text-lg mb-14" style={{ color: 'var(--nm-muted)' }}>
            Three simple steps to find your nomad match.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '✈️',
                title: 'Sign Up',
                desc: 'Create your account in under 60 seconds. Instant access to the community for $24/year.',
              },
              {
                step: '02',
                icon: '🌍',
                title: 'Build Your Profile',
                desc: 'Share your travel style, current location, future plans, and what you\'re looking for.',
              },
              {
                step: '03',
                icon: '❤️',
                title: 'Find Your Match',
                desc: 'Browse nomads who match your values, travel pace, and relationship goals.',
              },
            ].map((item) => (
              <div key={item.step} className="card p-8 text-center">
                <div
                  className="text-3xl mb-4"
                  role="img"
                  aria-label={item.title}
                >
                  {item.icon}
                </div>
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--nm-red)' }}
                >
                  Step {item.step}
                </div>
                <h3
                  className="text-lg font-bold mb-3"
                  style={{ color: 'var(--nm-black)' }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--nm-muted)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="py-20 px-4 text-center"
        style={{ background: 'var(--nm-black)' }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Your next adventure starts here.
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Join thousands of digital nomads who are already connecting.
          </p>
          <Link href="/register" className="btn-primary text-base px-10 py-4">
            Join Now — $24/year
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-4 text-center text-sm"
        style={{ background: '#050505', color: 'rgba(255,255,255,0.4)' }}
      >
        © {new Date().getFullYear()} NomadicMatch. All rights reserved.
      </footer>
    </div>
  )
}
