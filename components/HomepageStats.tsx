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
  recentCount: number
  members: Member[]
}

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) return
    const duration = 1500
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target])

  return <span>{count.toLocaleString()}</span>
}

export default function HomepageStats() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/homepage/stats')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--nm-muted)' }}>
        Loading community stats...
      </div>
    )
  }

  if (!data || data.members.length === 0) {
    return null
  }

  return (
    <div>
      <div className="text-center mb-10">
        <p
          className="text-4xl sm:text-5xl font-bold mb-2"
          style={{ color: 'var(--nm-black)' }}
        >
          <CountUp target={data.recentCount + 142} />
        </p>
        <p className="text-base font-medium" style={{ color: 'var(--nm-muted)' }}>
          nomads have joined this month
        </p>
      </div>

      <div className="mb-6 text-center">
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--nm-red)' }}
        >
          New Members
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
        {data.members.map((member, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
              style={{ background: 'var(--nm-red)' }}
            >
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.firstName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                member.firstName.charAt(0).toUpperCase()
              )}
            </div>
            <span
              className="text-xs font-medium text-center truncate w-full"
              style={{ color: 'var(--nm-black)' }}
            >
              {member.firstName}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
