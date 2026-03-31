'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserData {
  email: string
  username: string
  subscription: {
    status: string
    currentPeriodEnd?: string
    stripeCustomerId?: string
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Change email
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMsg, setEmailMsg] = useState('')

  // Change password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')

  // Visibility
  const [isVisible, setIsVisible] = useState(true)
  const [visibilityLoading, setVisibilityLoading] = useState(false)

  // Billing
  const [billingLoading, setBillingLoading] = useState(false)

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setIsVisible(data.profile.isVisible !== false)
        }
      })
  }, [])

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    setEmailLoading(true)
    setEmailMsg('')

    try {
      const res = await fetch('/api/settings/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      })
      const data = await res.json()
      setEmailMsg(res.ok ? 'Email updated!' : (data.error || 'Failed'))
    } catch {
      setEmailMsg('Failed to update email')
    } finally {
      setEmailLoading(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      setPasswordMsg('New password must be at least 8 characters')
      return
    }
    setPasswordLoading(true)
    setPasswordMsg('')

    try {
      const res = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      setPasswordMsg(res.ok ? 'Password updated!' : (data.error || 'Failed'))
      if (res.ok) {
        setCurrentPassword('')
        setNewPassword('')
      }
    } catch {
      setPasswordMsg('Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  async function handleVisibilityToggle() {
    setVisibilityLoading(true)
    const newVisible = !isVisible
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: newVisible }),
      })
      if (res.ok) setIsVisible(newVisible)
    } finally {
      setVisibilityLoading(false)
    }
  }

  async function handleManageBilling() {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Could not open billing portal')
    } finally {
      setBillingLoading(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') {
      setDeleteError('Type DELETE to confirm')
      return
    }
    setDeleteLoading(true)
    setDeleteError('')

    try {
      const res = await fetch('/api/settings/delete-account', { method: 'DELETE' })
      if (res.ok) {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/')
      } else {
        const data = await res.json()
        setDeleteError(data.error || 'Failed to delete account')
      }
    } catch {
      setDeleteError('Failed to delete account')
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--nm-white)' }}>
        <p style={{ color: 'var(--nm-muted)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--nm-white)' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--nm-black)' }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/browse" className="flex items-center gap-1">
            <span className="text-xl font-bold" style={{ color: 'var(--nm-red)' }}>Nomadic</span>
            <span className="text-xl font-bold text-white">Match</span>
          </Link>
          <Link href="/browse" className="text-sm text-white/70 hover:text-white transition-colors">
            ← Browse
          </Link>
        </div>
      </nav>

      <div className="max-w-xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--nm-black)' }}>Settings</h1>

        {/* Account info */}
        <section className="card p-6 mb-6">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--nm-black)' }}>Account</h2>
          <p className="text-sm mb-1" style={{ color: 'var(--nm-muted)' }}>
            Username: <strong style={{ color: 'var(--nm-black)' }}>@{user?.username}</strong>
          </p>
          <p className="text-sm" style={{ color: 'var(--nm-muted)' }}>
            Email: <strong style={{ color: 'var(--nm-black)' }}>{user?.email}</strong>
          </p>
        </section>

        {/* Change email */}
        <section className="card p-6 mb-6">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--nm-black)' }}>Change Email</h2>
          <form onSubmit={handleEmailChange} className="space-y-3">
            <input
              type="email"
              className="form-input"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New email address"
              required
            />
            <button type="submit" className="btn-primary py-2.5 px-5" disabled={emailLoading}>
              {emailLoading ? 'Updating...' : 'Update Email'}
            </button>
            {emailMsg && (
              <p className="text-sm" style={{ color: emailMsg.includes('updated') ? '#166534' : 'var(--nm-red)' }}>
                {emailMsg}
              </p>
            )}
          </form>
        </section>

        {/* Change password */}
        <section className="card p-6 mb-6">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--nm-black)' }}>Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              required
            />
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 chars)"
              required
            />
            <button type="submit" className="btn-primary py-2.5 px-5" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
            {passwordMsg && (
              <p className="text-sm" style={{ color: passwordMsg.includes('updated') ? '#166534' : 'var(--nm-red)' }}>
                {passwordMsg}
              </p>
            )}
          </form>
        </section>

        {/* Profile visibility */}
        <section className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold mb-1" style={{ color: 'var(--nm-black)' }}>Profile Visibility</h2>
              <p className="text-sm" style={{ color: 'var(--nm-muted)' }}>
                {isVisible ? 'Your profile is visible in browse.' : 'Your profile is hidden from browse.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleVisibilityToggle}
              disabled={visibilityLoading}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{
                background: isVisible ? 'var(--nm-red)' : '#D0D0D0',
              }}
            >
              <span
                className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                style={{ transform: isVisible ? 'translateX(1.375rem)' : 'translateX(0.25rem)' }}
              />
            </button>
          </div>
        </section>

        {/* Billing */}
        <section className="card p-6 mb-6">
          <h2 className="text-base font-bold mb-1" style={{ color: 'var(--nm-black)' }}>Billing</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--nm-muted)' }}>
            Subscription status:{' '}
            <span
              className="font-semibold"
              style={{
                color: user?.subscription?.status === 'active' ? '#166534' : 'var(--nm-red)',
              }}
            >
              {user?.subscription?.status || 'none'}
            </span>
          </p>
          <button
            type="button"
            onClick={handleManageBilling}
            className="btn-outline py-2.5 px-5"
            disabled={billingLoading}
          >
            {billingLoading ? 'Opening portal...' : 'Manage Billing'}
          </button>
        </section>

        {/* Sign out */}
        <section className="card p-6 mb-6">
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--nm-black)' }}>Sign Out</h2>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-outline py-2.5 px-5"
          >
            Sign out
          </button>
        </section>

        {/* Delete account */}
        <section className="card p-6" style={{ border: '1px solid #FFCCCC' }}>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--nm-red)' }}>Delete Account</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--nm-muted)' }}>
            This permanently deletes your account and profile. Type <strong>DELETE</strong> to confirm.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              className="form-input"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE"
            />
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'var(--nm-red)', whiteSpace: 'nowrap' }}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
          {deleteError && (
            <p className="mt-2 text-sm" style={{ color: 'var(--nm-red)' }}>{deleteError}</p>
          )}
        </section>
      </div>
    </div>
  )
}
