'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  category: string
  text: string
}

const QUESTIONS: Question[] = [
  // travel_pace
  { id: 'tp1', category: 'travel_pace', text: 'I prefer spending at least 2 weeks in each destination.' },
  { id: 'tp2', category: 'travel_pace', text: 'I get restless if I stay in one place for more than a week.' },
  { id: 'tp3', category: 'travel_pace', text: 'I enjoy slow travel and really getting to know a place.' },
  { id: 'tp4', category: 'travel_pace', text: 'I often visit multiple countries in a single month.' },
  { id: 'tp5', category: 'travel_pace', text: "I'd rather go deep in one city than skim many." },

  // lifestyle_stability
  { id: 'ls1', category: 'lifestyle_stability', text: 'Having a predictable monthly income feels important to me.' },
  { id: 'ls2', category: 'lifestyle_stability', text: "I'm comfortable not knowing where I'll be living in 3 months." },
  { id: 'ls3', category: 'lifestyle_stability', text: 'I prefer having a home base even while traveling.' },
  { id: 'ls4', category: 'lifestyle_stability', text: "Financial uncertainty doesn't stress me out." },
  { id: 'ls5', category: 'lifestyle_stability', text: "I like having routines even when I'm on the road." },

  // social_energy
  { id: 'se1', category: 'social_energy', text: 'I recharge by spending time alone.' },
  { id: 'se2', category: 'social_energy', text: 'I actively seek out digital nomad communities and meetups.' },
  { id: 'se3', category: 'social_energy', text: "I'm happy spending days at a time working solo." },
  { id: 'se4', category: 'social_energy', text: 'Meeting new people is one of my favorite parts of travel.' },
  { id: 'se5', category: 'social_energy', text: 'I prefer deep friendships over a wide social network.' },

  // relationship_goals
  { id: 'rg1', category: 'relationship_goals', text: "I'm looking for something serious and long-term." },
  { id: 'rg2', category: 'relationship_goals', text: "I'm open to relationships that span different time zones." },
  { id: 'rg3', category: 'relationship_goals', text: 'I want a partner who travels as much as I do.' },
  { id: 'rg4', category: 'relationship_goals', text: "I'd eventually like to settle in one place with the right person." },
  { id: 'rg5', category: 'relationship_goals', text: "I'm currently focused on experiences more than commitment." },

  // values_alignment
  { id: 'va1', category: 'values_alignment', text: 'Family obligations regularly shape my travel decisions.' },
  { id: 'va2', category: 'values_alignment', text: 'Career and financial growth are top priorities for me.' },
  { id: 'va3', category: 'values_alignment', text: 'Adventure and new experiences matter more than comfort.' },
  { id: 'va4', category: 'values_alignment', text: 'I value personal freedom above most other things.' },
  { id: 'va5', category: 'values_alignment', text: 'I want a partner who shares my exact lifestyle.' },

  // communication_style
  { id: 'cs1', category: 'communication_style', text: "I'm comfortable going several days without talking to a partner." },
  { id: 'cs2', category: 'communication_style', text: 'I prefer voice/video calls over texting.' },
  { id: 'cs3', category: 'communication_style', text: 'I handle time zone differences well in relationships.' },
  { id: 'cs4', category: 'communication_style', text: 'I need consistent daily contact to feel secure.' },
  { id: 'cs5', category: 'communication_style', text: "I'm good at expressing my feelings in writing." },
]

const SCALE = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
]

const CATEGORY_LABELS: Record<string, string> = {
  travel_pace: 'Travel Pace',
  lifestyle_stability: 'Lifestyle Stability',
  social_energy: 'Social Energy',
  relationship_goals: 'Relationship Goals',
  values_alignment: 'Values Alignment',
  communication_style: 'Communication Style',
}

export default function CompatibilityPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [scores, setScores] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState('')

  const question = QUESTIONS[current]
  const progress = ((current) / QUESTIONS.length) * 100
  const totalAnswered = Object.keys(answers).length

  function handleAnswer(value: number) {
    const newAnswers = { ...answers, [question.id]: value }
    setAnswers(newAnswers)

    // Auto-advance after short delay
    setTimeout(() => {
      if (current < QUESTIONS.length - 1) {
        setCurrent((c) => c + 1)
      }
    }, 200)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    const answerArray = QUESTIONS.map((q) => ({
      questionId: q.id,
      category: q.category,
      value: answers[q.id] || 3,
    }))

    try {
      const res = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerArray }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Submission failed')
        return
      }

      setScores(data.categoryScores)
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done && scores) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--nm-white)' }}>
        <nav style={{ background: 'var(--nm-black)' }}>
          <div className="max-w-6xl mx-auto px-4 flex items-center h-16">
            <Link href="/browse" className="flex items-center gap-1">
              <span className="text-xl font-bold" style={{ color: 'var(--nm-red)' }}>Nomadic</span>
              <span className="text-xl font-bold text-white">Match</span>
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex items-start justify-center px-4 py-12">
          <div className="w-full max-w-lg">
            <div className="text-center mb-10">
              <div className="text-5xl mb-4">🧭</div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--nm-black)' }}>
                Your Compatibility Profile
              </h1>
              <p style={{ color: 'var(--nm-muted)' }}>
                Your scores will be used to rank potential matches.
              </p>
            </div>

            <div className="card p-6 mb-8">
              {Object.entries(scores).map(([key, val]) => {
                const pct = Math.round(val * 100)
                return (
                  <div key={key} className="mb-5 last:mb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold" style={{ color: 'var(--nm-black)' }}>
                        {CATEGORY_LABELS[key] || key}
                      </span>
                      <span className="text-sm font-bold" style={{ color: 'var(--nm-red)' }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/browse" className="btn-primary text-center py-4">
                Browse Matches
              </Link>
              <button
                onClick={() => { setDone(false); setCurrent(0); setAnswers({}) }}
                className="btn-outline py-3"
              >
                Retake Test
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isLastQuestion = current === QUESTIONS.length - 1
  const currentAnswer = answers[question?.id]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--nm-white)' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--nm-black)' }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/browse" className="flex items-center gap-1">
            <span className="text-xl font-bold" style={{ color: 'var(--nm-red)' }}>Nomadic</span>
            <span className="text-xl font-bold text-white">Match</span>
          </Link>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {current + 1} / {QUESTIONS.length}
          </span>
        </div>
        <div className="h-1" style={{ background: '#1A1A1A' }}>
          <div
            className="h-1 transition-all duration-300"
            style={{ width: `${progress}%`, background: 'var(--nm-red)' }}
          />
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Category label */}
          <div
            className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-8"
            style={{ background: '#FFE8EC', color: 'var(--nm-red)' }}
          >
            {CATEGORY_LABELS[question?.category] || question?.category}
          </div>

          {/* Question */}
          <h2
            className="text-2xl sm:text-3xl font-bold mb-10 leading-tight"
            style={{ color: 'var(--nm-black)' }}
          >
            {question?.text}
          </h2>

          {/* Scale buttons */}
          <div className="flex flex-col gap-3">
            {SCALE.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleAnswer(opt.value)}
                className="w-full text-left px-5 py-4 rounded-xl font-medium text-base transition-all"
                style={{
                  background: currentAnswer === opt.value ? 'var(--nm-red)' : 'var(--nm-gray)',
                  color: currentAnswer === opt.value ? 'white' : 'var(--nm-black)',
                  border: currentAnswer === opt.value ? '2px solid var(--nm-red)' : '2px solid transparent',
                }}
              >
                <span
                  className="text-sm font-bold mr-3"
                  style={{ color: currentAnswer === opt.value ? 'rgba(255,255,255,0.7)' : 'var(--nm-muted)' }}
                >
                  {opt.value}
                </span>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              className="btn-outline py-2.5 px-5"
              disabled={current === 0}
              style={{ visibility: current === 0 ? 'hidden' : 'visible' }}
            >
              Back
            </button>

            {isLastQuestion ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="btn-primary py-3 px-8"
                disabled={submitting || totalAnswered < QUESTIONS.length}
              >
                {submitting ? 'Saving...' : 'See My Results'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrent((c) => c + 1)}
                className="btn-outline py-2.5 px-5"
                disabled={!currentAnswer}
              >
                Skip
              </button>
            )}
          </div>

          {error && (
            <p className="mt-4 text-sm text-center" style={{ color: 'var(--nm-red)' }}>{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
