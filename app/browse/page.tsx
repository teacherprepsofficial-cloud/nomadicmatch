'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProfileCard from '@/components/ProfileCard'

interface ProfileResult {
  _id: string
  userId: string
  firstName: string
  age?: number
  photos?: { url: string }[]
  currentLocation?: { city: string; country: string; countryCode: string }
  workStyle?: string
  seeking?: string[]
  compatibilityScore?: number
}

interface BrowseResponse {
  profiles: ProfileResult[]
  total: number
  page: number
  pages: number
}

// We need a username map — fetch it from the profile API
// For browse, we'll use userId as the link param since we don't have usernames here
// The profile/[userId] route handles both username and ObjectId lookups

export default function BrowsePage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ProfileResult[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const [seeking, setSeeking] = useState('')
  const [country, setCountry] = useState('')
  const [workStyle, setWorkStyle] = useState('')

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const fetchProfiles = useCallback(async (p: number, replace: boolean) => {
    if (p === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    const params = new URLSearchParams({ page: String(p), limit: '20' })
    if (seeking) params.set('seeking', seeking)
    if (country) params.set('country', country)
    if (workStyle) params.set('workStyle', workStyle)

    try {
      const res = await fetch(`/api/browse?${params}`)
      const data: BrowseResponse = await res.json()

      if (replace) {
        setProfiles(data.profiles || [])
      } else {
        setProfiles((prev) => [...prev, ...(data.profiles || [])])
      }
      setPage(data.page)
      setPages(data.pages)
      setTotal(data.total)
    } catch (err) {
      console.error('Browse fetch error:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [seeking, country, workStyle])

  useEffect(() => {
    fetchProfiles(1, true)
  }, [fetchProfiles])

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault()
    fetchProfiles(1, true)
  }

  function loadMore() {
    if (page < pages && !loadingMore) {
      fetchProfiles(page + 1, false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--nm-gray)' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--nm-black)' }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/browse" className="flex items-center gap-1">
            <span className="text-xl font-bold" style={{ color: 'var(--nm-red)' }}>Nomadic</span>
            <span className="text-xl font-bold text-white">Match</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/profile/edit" className="text-sm text-white/70 hover:text-white transition-colors">
              My Profile
            </Link>
            <Link href="/compatibility" className="text-sm text-white/70 hover:text-white transition-colors">
              Compatibility
            </Link>
            <Link href="/settings" className="text-sm text-white/70 hover:text-white transition-colors">
              Settings
            </Link>
            <button
              onClick={logout}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--nm-black)' }}>
            Find Your Nomad Match
          </h1>
          <p style={{ color: 'var(--nm-muted)' }}>
            {total > 0 ? `${total} nomads found` : 'Browse nomads worldwide'}
          </p>
        </div>

        {/* Filters */}
        <form
          onSubmit={handleFilterSubmit}
          className="card p-4 mb-8 flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-[140px]">
            <label className="form-label text-xs">Seeking</label>
            <select
              className="form-input"
              value={seeking}
              onChange={(e) => setSeeking(e.target.value)}
            >
              <option value="">All</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="nonbinary">Nonbinary</option>
              <option value="trans">Trans</option>
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="form-label text-xs">Country</label>
            <input
              type="text"
              className="form-input"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Thailand"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="form-label text-xs">Work style</label>
            <select
              className="form-input"
              value={workStyle}
              onChange={(e) => setWorkStyle(e.target.value)}
            >
              <option value="">All</option>
              <option value="fully-remote">Remote</option>
              <option value="freelance">Freelance</option>
              <option value="entrepreneur">Entrepreneur</option>
              <option value="content-creator">Creator</option>
            </select>
          </div>

          <button type="submit" className="btn-primary py-2.5 px-6 flex-shrink-0">
            Search
          </button>
        </form>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="card animate-pulse"
                style={{ aspectRatio: '3/4' }}
              >
                <div style={{ background: '#E8E8E8', height: '70%' }} />
                <div className="p-4 space-y-2">
                  <div style={{ background: '#E8E8E8', height: '1rem', width: '60%', borderRadius: '4px' }} />
                  <div style={{ background: '#E8E8E8', height: '0.75rem', width: '40%', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌍</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--nm-black)' }}>
              No nomads found
            </h2>
            <p style={{ color: 'var(--nm-muted)' }}>Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {profiles.map((profile) => (
                <ProfileCard
                  key={profile._id}
                  username={profile.userId}
                  firstName={profile.firstName}
                  age={profile.age}
                  city={profile.currentLocation?.city}
                  country={profile.currentLocation?.country}
                  countryCode={profile.currentLocation?.countryCode}
                  photoUrl={profile.photos?.[0]?.url}
                  compatibilityScore={profile.compatibilityScore}
                  workStyle={profile.workStyle}
                />
              ))}
            </div>

            {page < pages && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  className="btn-outline py-3 px-8"
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
