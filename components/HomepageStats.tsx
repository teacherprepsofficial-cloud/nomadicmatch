'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

interface Member {
  firstName: string
  photo: string | null
  city: string | null
  country: string | null
}

interface StatsData {
  totalUsers: number
  freeSpotsTaken: number
  freeSpotsLeft: number
  isFreeActive: boolean
  members: Member[]
}

function CountUp({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const start = performance.now()
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return <>{count}</>
}

function Avatar({ member, index }: { member: Member; index: number }) {
  const colors = ['#C41E3A', '#8B1A2E', '#E8354A', '#A01830', '#FF4060']
  return (
    <div className="flex flex-col items-center gap-2" style={{ animation: `fadeInUp 0.4s ease ${index * 0.06}s both` }}>
      <div className="relative rounded-full overflow-hidden flex items-center justify-center font-bold text-white text-sm"
        style={{ width: 52, height: 52, background: member.photo ? 'transparent' : colors[index % colors.length], border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        {member.photo ? (
          <Image src={member.photo} alt={member.firstName} fill style={{ objectFit: 'cover' }} />
        ) : (
          <span>{member.firstName[0].toUpperCase()}</span>
        )}
        {/* Live dot */}
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full" style={{ background: '#22c55e', border: '2px solid #0A0A0A' }} />
      </div>
      <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{member.firstName}</span>
    </div>
  )
}

export default function HomepageStats() {
  const [data, setData] = useState<StatsData | null>(null)

  useEffect(() => {
    fetch('/api/homepage/stats')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})

    // Refresh every 30s to feel live
    const interval = setInterval(() => {
      fetch('/api/homepage/stats').then(r => r.json()).then(setData).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const spotsLeft = data?.freeSpotsLeft ?? 100
  const spotsTaken = data?.freeSpotsTaken ?? 0
  const pct = Math.round((spotsTaken / 100) * 100)

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Smart chip */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
        style={{ background: 'rgba(196,30,58,0.15)', border: '1px solid rgba(196,30,58,0.4)', color: '#ff6b7a' }}>
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#C41E3A' }} />
        {data ? (
          <>
            {spotsLeft > 0
              ? `🔥 ${spotsLeft} free spot${spotsLeft === 1 ? '' : 's'} remaining — first 100 members get in free`
              : '✅ Free spots claimed — join for $24/year'}
          </>
        ) : (
          '🔥 First 100 members get in free'
        )}
      </div>

      {/* Progress bar */}
      {data && (
        <div className="w-full max-w-sm">
          <div className="flex justify-between text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span><CountUp target={spotsTaken} /> of 100 free spots claimed</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-2 rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #C41E3A, #ff4060)' }} />
          </div>
        </div>
      )}

      {/* Member avatars */}
      {data && data.members.length > 0 && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {data.members.slice(0, 8).map((m, i) => (
              <Avatar key={i} member={m} index={i} />
            ))}
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <CountUp target={data.totalUsers} /> nomads already joined
          </p>
        </div>
      )}

      {/* If no members yet, show placeholder avatars */}
      {(!data || data.members.length === 0) && (
        <div className="flex items-center gap-2">
          {['A','B','C','D','E','F'].map((l, i) => (
            <div key={l} className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: `rgba(196,30,58,${0.3 + i * 0.1})`, border: '2px solid rgba(255,255,255,0.08)', marginLeft: i > 0 ? -8 : 0 }}>
              {l}
            </div>
          ))}
          <span className="ml-3 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Be one of the first</span>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
