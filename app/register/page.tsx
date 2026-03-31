'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordsMatch = password.length > 0 && passwordConfirm.length > 0 && password === passwordConfirm

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      // Free founding member — go straight to onboarding
      if (data.isFree) {
        router.push('/onboarding')
        return
      }

      // Paid — go to Stripe checkout
      const checkoutRes = await fetch('/api/stripe/create-checkout', { method: 'POST' })
      const checkoutData = await checkoutRes.json()
      if (checkoutData.url) {
        window.location.href = checkoutData.url
      } else {
        router.push('/subscribe')
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
              Join NomadicMatch
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--nm-muted)' }}>
              Connect with single digital nomads worldwide.
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
                <label className="form-label" htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  type="text"
                  className="form-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alex"
                  required
                  autoComplete="given-name"
                />
              </div>

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
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label" htmlFor="passwordConfirm">Confirm password</label>
                  {passwordsMatch && (
                    <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#16a34a' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#16a34a"/><path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Passwords match
                    </span>
                  )}
                </div>
                <input
                  id="passwordConfirm"
                  type="password"
                  className="form-input"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  autoComplete="new-password"
                  style={passwordConfirm.length > 0 && !passwordsMatch ? { borderColor: '#C41E3A' } : passwordsMatch ? { borderColor: '#16a34a' } : {}}
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
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3"
                disabled={loading}
              >
                {loading ? 'Redirecting to checkout...' : 'Create Account & Subscribe — $24/year'}
              </button>

              <p className="text-xs text-center" style={{ color: '#9B9B9B' }}>
                By joining, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: 'var(--nm-muted)' }}>
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold"
                style={{ color: 'var(--nm-red)' }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
