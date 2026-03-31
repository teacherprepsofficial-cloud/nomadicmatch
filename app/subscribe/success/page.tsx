'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function SubscribeSuccessPage() {
  // Update the nm_sub cookie so middleware lets us through
  useEffect(() => {
    document.cookie = 'nm_sub=active; path=/; max-age=2592000; samesite=lax'
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--nm-white)' }}>
      <div className="w-full max-w-md text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-8"
          style={{ background: '#FFE8EC' }}
        >
          🎉
        </div>

        <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--nm-black)' }}>
          You&apos;re in!
        </h1>
        <p className="text-lg mb-8" style={{ color: 'var(--nm-muted)' }}>
          Payment successful. Let&apos;s build your profile and find your match.
        </p>

        <Link href="/onboarding" className="btn-primary text-base px-8 py-4">
          Build My Profile
        </Link>

        <p className="mt-6 text-sm" style={{ color: '#9B9B9B' }}>
          Takes about 5 minutes. You can always edit later.
        </p>
      </div>
    </div>
  )
}
