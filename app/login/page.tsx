'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Redirect based on account state
      if (data.subscriptionStatus !== 'active') {
        router.push('/subscribe')
      } else if (!data.profileComplete) {
        router.push('/onboarding')
      } else {
        router.push('/browse')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--nm-white)' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--nm-black)' }} className="flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 flex items-center h-16">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-bold" style={{ color: 'var(--nm-red)' }}>Nomadic</span>
            <span className="text-xl font-bold text-white">Match</span>
          </Link>
        </div>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="card p-8 sm:p-10">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--nm-black)' }}>
              Welcome back
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--nm-muted)' }}>
              Sign in to your NomadicMatch account
            </p>

            {error && (
              <div
                className="p-4 rounded-lg text-sm mb-6"
                style={{ background: '#FFF0F0', color: 'var(--nm-red)', border: '1px solid #FFCCCC' }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: 'var(--nm-muted)' }}>
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold"
                style={{ color: 'var(--nm-red)' }}
              >
                Join NomadicMatch
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
