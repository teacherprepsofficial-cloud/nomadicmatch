'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Photo {
  url: string
  order: number
}

interface TravelPlan {
  destination: string
  city?: string
  country?: string
  countryCode?: string
  startDate?: string
  endDate?: string
  notes?: string
}

interface Profile {
  firstName: string
  age?: number
  bio?: string
  pronouns?: string
  genderIdentity?: string
  seeking?: string[]
  photos?: Photo[]
  currentLocation?: { city: string; country: string; countryCode: string }
  travelPlans?: TravelPlan[]
  workStyle?: string
  workDescription?: string
  lifestyle?: string[]
  languages?: string[]
  socials?: {
    instagram?: string
    twitter?: string
    linkedin?: string
    tiktok?: string
    email?: string
    website?: string
  }
}

function getFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return ''
  const codePoints = [...countryCode.toUpperCase()].map(
    (char) => 127397 + char.charCodeAt(0)
  )
  return String.fromCodePoint(...codePoints)
}

const WORK_STYLE_LABELS: Record<string, string> = {
  'fully-remote': 'Fully remote',
  freelance: 'Freelancer',
  entrepreneur: 'Entrepreneur',
  'content-creator': 'Content creator',
  other: 'Other',
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [photoIdx, setPhotoIdx] = useState(0)
  const [compatibilityScore, setCompatibilityScore] = useState<number | null>(null)

  useEffect(() => {
    if (!username) return

    fetch(`/api/profile/${username}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile)
        } else {
          setError('Profile not found')
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load profile')
        setLoading(false)
      })
  }, [username])

  // Fetch viewer's compatibility test to compute score
  useEffect(() => {
    if (!profile) return

    // We'd need both tests to compute — this would be done server-side ideally
    // For simplicity, show score if already attached via the browse endpoint
  }, [profile])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--nm-white)' }}>
        <p style={{ color: 'var(--nm-muted)' }}>Loading profile...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--nm-white)' }}>
        <p className="text-xl font-bold" style={{ color: 'var(--nm-black)' }}>Profile not found</p>
        <Link href="/browse" className="btn-primary">Back to Browse</Link>
      </div>
    )
  }

  const photos = profile.photos || []
  const currentPhoto = photos[photoIdx]
  const locationParts = profile.currentLocation
    ? [profile.currentLocation.city, profile.currentLocation.country].filter(Boolean).join(', ')
    : ''
  const flag = profile.currentLocation?.countryCode ? getFlag(profile.currentLocation.countryCode) : ''

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--nm-white)' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--nm-black)' }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/browse" className="flex items-center gap-1">
            <span className="text-xl font-bold" style={{ color: 'var(--nm-red)' }}>Nomadic</span>
            <span className="text-xl font-bold text-white">Match</span>
          </Link>
          <button
            onClick={() => router.back()}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Photo carousel */}
          <div>
            <div
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
              style={{ background: 'var(--nm-gray)' }}
              onClick={() => photos.length > 1 && setPhotoIdx((i) => (i + 1) % photos.length)}
            >
              {currentPhoto ? (
                <Image
                  src={currentPhoto.url}
                  alt={profile.firstName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center text-7xl font-bold"
                  style={{ color: 'var(--nm-red)', background: '#FFF0F2' }}
                >
                  {profile.firstName.charAt(0).toUpperCase()}
                </div>
              )}

              {compatibilityScore !== null && (
                <div
                  className="absolute top-3 right-3 w-14 h-14 rounded-full flex flex-col items-center justify-center text-white"
                  style={{ background: 'var(--nm-red)', boxShadow: '0 4px 12px rgba(196,30,58,0.4)' }}
                >
                  <span className="text-sm font-bold leading-none">{compatibilityScore}%</span>
                  <span className="text-xs opacity-75">match</span>
                </div>
              )}
            </div>

            {/* Photo dots */}
            {photos.length > 1 && (
              <div className="flex gap-1.5 justify-center mt-3">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotoIdx(i)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      background: i === photoIdx ? 'var(--nm-red)' : '#D0D0D0',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Profile info */}
          <div className="flex flex-col gap-6">
            {/* Name / basics */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-1">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--nm-black)' }}>
                  {profile.firstName}
                  {profile.age && <span style={{ color: 'var(--nm-muted)' }}>, {profile.age}</span>}
                </h1>
              </div>
              {profile.pronouns && (
                <p className="text-sm" style={{ color: 'var(--nm-muted)' }}>{profile.pronouns}</p>
              )}
              {locationParts && (
                <p className="mt-2 text-base font-medium" style={{ color: 'var(--nm-black)' }}>
                  {flag && <span className="mr-1">{flag}</span>}
                  {locationParts}
                </p>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--nm-muted)' }}>About</h3>
                <p className="text-base leading-relaxed" style={{ color: 'var(--nm-black)' }}>
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Work */}
            {(profile.workStyle || profile.workDescription) && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--nm-muted)' }}>Work</h3>
                {profile.workStyle && (
                  <span
                    className="inline-block text-sm px-3 py-1 rounded-full font-medium mr-2 mb-2"
                    style={{ background: 'var(--nm-gray)', color: 'var(--nm-black)' }}
                  >
                    {WORK_STYLE_LABELS[profile.workStyle] || profile.workStyle}
                  </span>
                )}
                {profile.workDescription && (
                  <p className="text-sm" style={{ color: 'var(--nm-muted)' }}>{profile.workDescription}</p>
                )}
              </div>
            )}

            {/* Lifestyle */}
            {profile.lifestyle && profile.lifestyle.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--nm-muted)' }}>Lifestyle</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.lifestyle.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1 rounded-full"
                      style={{ background: '#FFE8EC', color: 'var(--nm-red)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--nm-muted)' }}>Languages</h3>
                <p className="text-sm" style={{ color: 'var(--nm-black)' }}>
                  {profile.languages.join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Travel Plans */}
        {profile.travelPlans && profile.travelPlans.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--nm-black)' }}>
              Upcoming Travel
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.travelPlans.map((plan, idx) => {
                const planFlag = plan.countryCode ? getFlag(plan.countryCode) : ''
                return (
                  <div key={idx} className="card p-4">
                    <p className="font-bold mb-1" style={{ color: 'var(--nm-black)' }}>
                      {planFlag && <span className="mr-1">{planFlag}</span>}
                      {plan.destination || [plan.city, plan.country].filter(Boolean).join(', ')}
                    </p>
                    {(plan.startDate || plan.endDate) && (
                      <p className="text-sm" style={{ color: 'var(--nm-muted)' }}>
                        {plan.startDate ? new Date(plan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                        {plan.startDate && plan.endDate ? ' – ' : ''}
                        {plan.endDate ? new Date(plan.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </p>
                    )}
                    {plan.notes && (
                      <p className="text-sm mt-2" style={{ color: 'var(--nm-muted)' }}>{plan.notes}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Socials / Connect */}
        {profile.socials && Object.values(profile.socials).some(Boolean) && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--nm-black)' }}>
              Connect with {profile.firstName}
            </h3>
            <div className="card p-6">
              <p className="text-sm mb-5" style={{ color: 'var(--nm-muted)' }}>
                Reach out directly via {profile.firstName}&apos;s social profiles below.
              </p>
              <div className="flex flex-wrap gap-3">
                {profile.socials.instagram && (
                  <a
                    href={`https://instagram.com/${profile.socials.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline py-2 px-4 text-sm"
                  >
                    Instagram {profile.socials.instagram}
                  </a>
                )}
                {profile.socials.twitter && (
                  <a
                    href={`https://x.com/${profile.socials.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline py-2 px-4 text-sm"
                  >
                    X/Twitter {profile.socials.twitter}
                  </a>
                )}
                {profile.socials.linkedin && (
                  <a
                    href={profile.socials.linkedin.startsWith('http') ? profile.socials.linkedin : `https://${profile.socials.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline py-2 px-4 text-sm"
                  >
                    LinkedIn
                  </a>
                )}
                {profile.socials.tiktok && (
                  <a
                    href={`https://tiktok.com/@${profile.socials.tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline py-2 px-4 text-sm"
                  >
                    TikTok {profile.socials.tiktok}
                  </a>
                )}
                {profile.socials.email && (
                  <a
                    href={`mailto:${profile.socials.email}`}
                    className="btn-primary py-2 px-4 text-sm"
                  >
                    Send Email
                  </a>
                )}
                {profile.socials.website && (
                  <a
                    href={profile.socials.website.startsWith('http') ? profile.socials.website : `https://${profile.socials.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline py-2 px-4 text-sm"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
