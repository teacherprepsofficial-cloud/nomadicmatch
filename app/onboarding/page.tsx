'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const TOTAL_STEPS = 6

interface TravelPlan {
  destination: string
  city: string
  country: string
  countryCode: string
  startDate: string
  endDate: string
  notes: string
}

interface ProfileData {
  firstName: string
  age: string
  bio: string
  pronouns: string
  genderIdentity: string
  seeking: string[]
  photos: string[]
  currentLocation: { city: string; country: string; countryCode: string }
  travelPlans: TravelPlan[]
  workStyle: string
  workDescription: string
  lifestyle: string[]
  languages: string
  socials: {
    instagram: string
    twitter: string
    linkedin: string
    tiktok: string
    email: string
    website: string
  }
}

const LIFESTYLE_OPTIONS = ['Van life', 'Slow travel', 'Fast travel', 'Base hopper', 'Seasonal']
const SEEKING_OPTIONS = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'nonbinary', label: 'Nonbinary people' },
  { value: 'trans', label: 'Trans people' },
  { value: 'everyone', label: 'Everyone' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    age: '',
    bio: '',
    pronouns: '',
    genderIdentity: '',
    seeking: [],
    photos: [],
    currentLocation: { city: '', country: '', countryCode: '' },
    travelPlans: [],
    workStyle: '',
    workDescription: '',
    lifestyle: [],
    languages: '',
    socials: {
      instagram: '',
      twitter: '',
      linkedin: '',
      tiktok: '',
      email: '',
      website: '',
    },
  })

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  function updateProfile(updates: Partial<ProfileData>) {
    setProfile((p) => ({ ...p, ...updates }))
  }

  function toggleArrayItem(arr: string[], item: string): string[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
  }

  async function saveProgress() {
    setSaving(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        firstName: profile.firstName,
        age: parseInt(profile.age),
        bio: profile.bio,
        pronouns: profile.pronouns,
        genderIdentity: profile.genderIdentity || undefined,
        seeking: profile.seeking,
        currentLocation: profile.currentLocation.city
          ? {
              ...profile.currentLocation,
              updatedAt: new Date().toISOString(),
            }
          : undefined,
        travelPlans: profile.travelPlans,
        workStyle: profile.workStyle || undefined,
        workDescription: profile.workDescription,
        lifestyle: profile.lifestyle,
        languages: profile.languages
          ? profile.languages.split(',').map((l) => l.trim()).filter(Boolean)
          : [],
        socials: profile.socials,
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 401 || res.status === 403) {
        router.push('/login')
        return false
      }
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        return false
      }
      return true
    } catch {
      setError('Failed to save. Please try again.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function handleNext() {
    setError('')
    // Validate step 1
    if (step === 1) {
      if (!profile.firstName.trim()) { setError('First name is required'); return }
      if (!profile.age || parseInt(profile.age) < 18) { setError('You must be 18 or older'); return }
    }
    // Validate step 2
    if (step === 2) {
      if (profile.photos.length === 0) { setError('Please add at least one photo'); return }
    }

    const ok = await saveProgress()
    if (!ok) return

    setStep((s) => s + 1)
  }

  function handleBack() {
    setError('')
    setStep((s) => s - 1)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setSaving(true)
    setError('')

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('photo', file)

      try {
        const res = await fetch('/api/profile/photos', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (res.ok) {
          updateProfile({ photos: [...profile.photos, data.url] })
        } else {
          setError(data.error || 'Upload failed')
        }
      } catch {
        setError('Upload failed')
      }
    }

    setSaving(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleRemovePhoto(idx: number) {
    const res = await fetch('/api/profile/photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoIndex: idx }),
    })
    if (res.ok) {
      const newPhotos = [...profile.photos]
      newPhotos.splice(idx, 1)
      updateProfile({ photos: newPhotos })
    }
  }

  async function handleSkipCompatibility() {
    await saveProgress()
    // Update nm_profile cookie
    document.cookie = 'nm_profile=true; path=/; max-age=2592000; samesite=lax'
    router.push('/browse')
  }

  function addTravelPlan() {
    updateProfile({
      travelPlans: [
        ...profile.travelPlans,
        { destination: '', city: '', country: '', countryCode: '', startDate: '', endDate: '', notes: '' },
      ],
    })
  }

  function updateTravelPlan(idx: number, updates: Partial<TravelPlan>) {
    const plans = [...profile.travelPlans]
    plans[idx] = { ...plans[idx], ...updates }
    updateProfile({ travelPlans: plans })
  }

  function removeTravelPlan(idx: number) {
    updateProfile({ travelPlans: profile.travelPlans.filter((_, i) => i !== idx) })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--nm-white)' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--nm-black)' }}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-bold" style={{ color: 'var(--nm-red)' }}>Nomadic</span>
            <span className="text-xl font-bold text-white">Match</span>
          </Link>
          <span className="text-sm text-white/50">Step {step} of {TOTAL_STEPS}</span>
        </div>
        {/* Progress bar */}
        <div className="h-1" style={{ background: '#1A1A1A' }}>
          <div
            className="h-1 transition-all duration-500"
            style={{ width: `${progress}%`, background: 'var(--nm-red)' }}
          />
        </div>
      </nav>

      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl">

          {error && (
            <div
              className="p-4 rounded-lg text-sm mb-6"
              style={{ background: '#FFF0F0', color: 'var(--nm-red)', border: '1px solid #FFCCCC' }}
            >
              {error}
            </div>
          )}

          {/* Step 1: About You */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--nm-black)' }}>About You</h1>
              <p className="text-sm mb-8" style={{ color: 'var(--nm-muted)' }}>Tell other nomads who you are.</p>

              <div className="space-y-5">
                <div>
                  <label className="form-label">First name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.firstName}
                    onChange={(e) => updateProfile({ firstName: e.target.value })}
                    placeholder="Alex"
                  />
                </div>

                <div>
                  <label className="form-label">Age *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={profile.age}
                    onChange={(e) => updateProfile({ age: e.target.value })}
                    placeholder="28"
                    min="18"
                    max="99"
                  />
                </div>

                <div>
                  <label className="form-label">Bio <span style={{ color: '#9B9B9B', fontWeight: 400 }}>(optional)</span></label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => updateProfile({ bio: e.target.value })}
                    placeholder="Tell us a bit about yourself — your story, what you love about the nomad life..."
                    maxLength={500}
                    style={{ resize: 'vertical' }}
                  />
                  <p className="text-xs mt-1" style={{ color: '#9B9B9B' }}>{profile.bio.length}/500</p>
                </div>

                <div>
                  <label className="form-label">Pronouns <span style={{ color: '#9B9B9B', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.pronouns}
                    onChange={(e) => updateProfile({ pronouns: e.target.value })}
                    placeholder="e.g. she/her, he/him, they/them"
                  />
                </div>

                <div>
                  <label className="form-label">Gender identity <span style={{ color: '#9B9B9B', fontWeight: 400 }}>(optional)</span></label>
                  <select
                    className="form-input"
                    value={profile.genderIdentity}
                    onChange={(e) => updateProfile({ genderIdentity: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="man">Man</option>
                    <option value="woman">Woman</option>
                    <option value="nonbinary">Nonbinary</option>
                    <option value="trans man">Trans man</option>
                    <option value="trans woman">Trans woman</option>
                    <option value="genderqueer">Genderqueer</option>
                    <option value="other">Other / prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">I&apos;m open to dating <span style={{ color: '#9B9B9B', fontWeight: 400 }}>(select all that apply)</span></label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SEEKING_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateProfile({ seeking: toggleArrayItem(profile.seeking, opt.value) })}
                        className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                        style={{
                          background: profile.seeking.includes(opt.value) ? 'var(--nm-red)' : 'var(--nm-gray)',
                          color: profile.seeking.includes(opt.value) ? 'white' : 'var(--nm-black)',
                          border: '1px solid transparent',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Photos */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--nm-black)' }}>Your Photos</h1>
              <p className="text-sm mb-8" style={{ color: 'var(--nm-muted)' }}>
                Add up to 10 photos. Your first photo is your profile picture.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {profile.photos.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden" style={{ background: 'var(--nm-gray)' }}>
                    <Image
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ background: 'rgba(0,0,0,0.6)' }}
                    >
                      ✕
                    </button>
                    {idx === 0 && (
                      <div
                        className="absolute bottom-1 left-1 text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'var(--nm-red)', color: 'white' }}
                      >
                        Main
                      </div>
                    )}
                  </div>
                ))}

                {profile.photos.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="aspect-square rounded-xl flex flex-col items-center justify-center gap-2 text-sm font-medium transition-colors"
                    style={{
                      background: 'var(--nm-gray)',
                      color: 'var(--nm-muted)',
                      border: '2px dashed #D0D0D0',
                    }}
                  >
                    <span className="text-2xl">+</span>
                    Add photo
                  </button>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />

              {saving && (
                <p className="text-sm" style={{ color: 'var(--nm-muted)' }}>Uploading...</p>
              )}
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--nm-black)' }}>Location & Travel</h1>
              <p className="text-sm mb-8" style={{ color: 'var(--nm-muted)' }}>
                Where are you now, and where are you going?
              </p>

              <div className="space-y-5">
                <div>
                  <label className="form-label">Current city</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.currentLocation.city}
                    onChange={(e) =>
                      updateProfile({
                        currentLocation: { ...profile.currentLocation, city: e.target.value },
                      })
                    }
                    placeholder="Chiang Mai"
                  />
                </div>

                <div>
                  <label className="form-label">Current country</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.currentLocation.country}
                    onChange={(e) =>
                      updateProfile({
                        currentLocation: { ...profile.currentLocation, country: e.target.value },
                      })
                    }
                    placeholder="Thailand"
                  />
                </div>

                <div>
                  <label className="form-label">Country code <span style={{ color: '#9B9B9B', fontWeight: 400 }}>(2 letters, for flag)</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.currentLocation.countryCode}
                    onChange={(e) =>
                      updateProfile({
                        currentLocation: {
                          ...profile.currentLocation,
                          countryCode: e.target.value.toUpperCase().slice(0, 2),
                        },
                      })
                    }
                    placeholder="TH"
                    maxLength={2}
                    style={{ maxWidth: '6rem' }}
                  />
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="form-label" style={{ marginBottom: 0 }}>Future travel plans</label>
                    <button
                      type="button"
                      onClick={addTravelPlan}
                      className="text-sm font-semibold"
                      style={{ color: 'var(--nm-red)' }}
                    >
                      + Add destination
                    </button>
                  </div>

                  {profile.travelPlans.length === 0 && (
                    <p className="text-sm" style={{ color: '#9B9B9B' }}>
                      No plans added yet. Let others know where you&apos;re heading.
                    </p>
                  )}

                  {profile.travelPlans.map((plan, idx) => (
                    <div
                      key={idx}
                      className="card p-4 mb-4"
                      style={{ border: '1px solid #E8E8E8' }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold" style={{ color: 'var(--nm-black)' }}>
                          Destination {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTravelPlan(idx)}
                          className="text-xs"
                          style={{ color: 'var(--nm-muted)' }}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="City / destination"
                          value={plan.destination}
                          onChange={(e) => updateTravelPlan(idx, { destination: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Country"
                            value={plan.country}
                            onChange={(e) => updateTravelPlan(idx, { country: e.target.value })}
                          />
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Code (e.g. JP)"
                            value={plan.countryCode}
                            onChange={(e) => updateTravelPlan(idx, { countryCode: e.target.value.toUpperCase().slice(0, 2) })}
                            maxLength={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs" style={{ color: 'var(--nm-muted)' }}>From</label>
                            <input
                              type="date"
                              className="form-input"
                              value={plan.startDate}
                              onChange={(e) => updateTravelPlan(idx, { startDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-xs" style={{ color: 'var(--nm-muted)' }}>To</label>
                            <input
                              type="date"
                              className="form-input"
                              value={plan.endDate}
                              onChange={(e) => updateTravelPlan(idx, { endDate: e.target.value })}
                            />
                          </div>
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Notes (optional)"
                          value={plan.notes}
                          onChange={(e) => updateTravelPlan(idx, { notes: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Work & Lifestyle */}
          {step === 4 && (
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--nm-black)' }}>Work & Lifestyle</h1>
              <p className="text-sm mb-8" style={{ color: 'var(--nm-muted)' }}>
                How do you work and travel?
              </p>

              <div className="space-y-5">
                <div>
                  <label className="form-label">Work style</label>
                  <select
                    className="form-input"
                    value={profile.workStyle}
                    onChange={(e) => updateProfile({ workStyle: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="fully-remote">Fully remote employee</option>
                    <option value="freelance">Freelancer / contractor</option>
                    <option value="entrepreneur">Entrepreneur / founder</option>
                    <option value="content-creator">Content creator</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">What you do <span style={{ color: '#9B9B9B', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.workDescription}
                    onChange={(e) => updateProfile({ workDescription: e.target.value })}
                    placeholder="e.g. UX designer, indie hacker, travel photographer..."
                  />
                </div>

                <div>
                  <label className="form-label">Travel lifestyle <span style={{ color: '#9B9B9B', fontWeight: 400 }}>(select all that apply)</span></label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {LIFESTYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateProfile({ lifestyle: toggleArrayItem(profile.lifestyle, opt) })}
                        className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                        style={{
                          background: profile.lifestyle.includes(opt) ? 'var(--nm-red)' : 'var(--nm-gray)',
                          color: profile.lifestyle.includes(opt) ? 'white' : 'var(--nm-black)',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label">Languages spoken <span style={{ color: '#9B9B9B', fontWeight: 400 }}>(comma-separated)</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.languages}
                    onChange={(e) => updateProfile({ languages: e.target.value })}
                    placeholder="English, Spanish, Mandarin"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Socials */}
          {step === 5 && (
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--nm-black)' }}>Connect</h1>
              <p className="text-sm mb-3" style={{ color: 'var(--nm-muted)' }}>
                This is how other nomads will reach out to you.
              </p>
              <div
                className="p-4 rounded-xl text-sm mb-8"
                style={{ background: '#F0F7FF', color: '#0066CC', border: '1px solid #CCE5FF' }}
              >
                We don&apos;t have in-app messaging — interested nomads will contact you directly via your socials. Add whatever you&apos;re comfortable sharing.
              </div>

              <div className="space-y-4">
                {[
                  { key: 'instagram', label: 'Instagram', placeholder: '@yourhandle' },
                  { key: 'twitter', label: 'X / Twitter', placeholder: '@yourhandle' },
                  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/yourname' },
                  { key: 'tiktok', label: 'TikTok', placeholder: '@yourhandle' },
                  { key: 'email', label: 'Contact email', placeholder: 'hello@yoursite.com' },
                  { key: 'website', label: 'Website / blog', placeholder: 'https://yoursite.com' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="form-label">{label}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.socials[key as keyof typeof profile.socials]}
                      onChange={(e) =>
                        updateProfile({
                          socials: { ...profile.socials, [key]: e.target.value },
                        })
                      }
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Compatibility */}
          {step === 6 && (
            <div className="text-center">
              <div className="text-5xl mb-6">🧭</div>
              <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--nm-black)' }}>
                Compatibility Test
              </h1>
              <p className="text-base mb-8 leading-relaxed" style={{ color: 'var(--nm-muted)' }}>
                Take our 30-question compatibility test to get ranked matches based on travel pace, lifestyle, relationship goals, and more.
              </p>

              <div className="card p-6 mb-6 text-left">
                <h3 className="font-semibold mb-3" style={{ color: 'var(--nm-black)' }}>What you get:</h3>
                <ul className="space-y-2">
                  {[
                    'Compatibility % shown on every profile you view',
                    'Your matches are sorted by compatibility score',
                    'Takes about 5 minutes',
                    'You can retake it at any time',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <span style={{ color: 'var(--nm-red)' }}>✓</span>
                      <span style={{ color: 'var(--nm-black)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <a href="/compatibility" className="btn-primary py-4 text-base">
                  Take the Compatibility Test
                </a>
                <button
                  type="button"
                  onClick={handleSkipCompatibility}
                  className="btn-outline py-3 text-base"
                >
                  Skip for now — Go to Browse
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 6 && (
            <div className="flex items-center justify-between mt-10">
              <button
                type="button"
                onClick={handleBack}
                className="btn-outline py-3 px-6"
                disabled={step === 1}
                style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="btn-primary py-3 px-8"
                disabled={saving}
              >
                {saving ? 'Saving...' : step === 5 ? 'Continue' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
