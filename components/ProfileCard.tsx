'use client'

import Image from 'next/image'
import Link from 'next/link'

interface ProfileCardProps {
  username?: string
  firstName: string
  age?: number
  city?: string
  country?: string
  countryCode?: string
  photoUrl?: string
  compatibilityScore?: number
  workStyle?: string
}

function getFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return ''
  const codePoints = [...countryCode.toUpperCase()].map(
    (char) => 127397 + char.charCodeAt(0)
  )
  return String.fromCodePoint(...codePoints)
}

export default function ProfileCard({
  username,
  firstName,
  age,
  city,
  country,
  countryCode,
  photoUrl,
  compatibilityScore,
  workStyle,
}: ProfileCardProps) {
  const href = username ? `/profile/${username}` : '#'
  const flag = countryCode ? getFlag(countryCode) : ''

  const locationParts = [city, country].filter(Boolean).join(', ')

  const workStyleLabels: Record<string, string> = {
    'fully-remote': 'Remote',
    freelance: 'Freelance',
    entrepreneur: 'Founder',
    'content-creator': 'Creator',
    other: 'Nomad',
  }

  return (
    <Link href={href} className="block group">
      <div
        className="card overflow-hidden transition-transform duration-200 group-hover:-translate-y-1"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        {/* Photo */}
        <div className="relative aspect-square" style={{ background: 'var(--nm-gray)' }}>
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={firstName}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-5xl font-bold"
              style={{ color: 'var(--nm-red)', background: '#FFF0F2' }}
            >
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Compatibility badge */}
          {compatibilityScore !== undefined && (
            <div
              className="absolute top-2 right-2 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'var(--nm-red)', boxShadow: '0 2px 8px rgba(196,30,58,0.4)' }}
            >
              {compatibilityScore}%
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-base leading-tight" style={{ color: 'var(--nm-black)' }}>
              {firstName}{age ? `, ${age}` : ''}
            </h3>
            {workStyle && workStyleLabels[workStyle] && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{ background: 'var(--nm-gray)', color: 'var(--nm-muted)' }}
              >
                {workStyleLabels[workStyle]}
              </span>
            )}
          </div>

          {(locationParts || flag) && (
            <p className="text-sm" style={{ color: 'var(--nm-muted)' }}>
              {flag && <span className="mr-1">{flag}</span>}
              {locationParts}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
