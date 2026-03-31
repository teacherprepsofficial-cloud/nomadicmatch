'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SubscribePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubscribe() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Could not start checkout')
        return
      }

      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--nm-white)' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--nm-black)' }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-bold" style={{ color: 'var(--nm-red)' }}>Nomadic</span>
            <span className="text-xl font-bold text-white">Match</span>
          </Link>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              window.location.href = '/'
            }}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <div
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{ background: '#FFE8EC', color: 'var(--nm-red)' }}
            >
              One-time annual payment
            </div>
            <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--nm-black)' }}>
              Get Full Access
            </h1>
            <p className="text-lg" style={{ color: 'var(--nm-muted)' }}>
              Join the NomadicMatch community today.
            </p>
          </div>

          <div className="card p-8 mb-6">
            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-bold" style={{ color: 'var(--nm-black)' }}>$24</span>
              <span className="text-lg mb-2" style={{ color: 'var(--nm-muted)' }}>/year</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                'Browse all nomad profiles',
                'See compatibility scores',
                'Share your travel plans',
                'Connect via social links',
                'Take the compatibility test',
                'Unlimited profile views',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs"
                    style={{ background: 'var(--nm-red)' }}
                  >
                    ✓
                  </span>
                  <span style={{ color: 'var(--nm-black)' }}>{feature}</span>
                </li>
              ))}
            </ul>

            {error && (
              <div
                className="p-3 rounded-lg text-sm mb-4"
                style={{ background: '#FFF0F0', color: 'var(--nm-red)' }}
              >
                {error}
              </div>
            )}

            <button
              onClick={handleSubscribe}
              className="btn-primary w-full py-4 text-base"
              disabled={loading}
            >
              {loading ? 'Redirecting to checkout...' : 'Subscribe Now — $24/year'}
            </button>

            <p className="mt-4 text-xs text-center" style={{ color: '#9B9B9B' }}>
              Secured by Stripe. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
