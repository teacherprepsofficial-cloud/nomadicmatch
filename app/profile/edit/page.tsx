'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

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

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
    socials: { instagram: '', twitter: '', linkedin: '', tiktok: '', email: '', website: '' },
  })

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          const p = data.profile
          setProfile({
            firstName: p.firstName || '',
            age: p.age ? String(p.age) : '',
            bio: p.bio || '',
            pronouns: p.pronouns || '',
            genderIdentity: p.genderIdentity || '',
            seeking: p.seeking || [],
            photos: (p.photos || []).map((ph: { url: string }) => ph.url),
            currentLocation: p.currentLocation || { city: '', country: '', countryCode: '' },
            travelPlans: (p.travelPlans || []).map((tp: TravelPlan & { startDate?: string; endDate?: string }) => ({
              ...tp,
              startDate: tp.startDate ? tp.startDate.substring(0, 10) : '',
              endDate: tp.endDate ? tp.endDate.substring(0, 10) : '',
            })),
            workStyle: p.workStyle || '',
            workDescription: p.workDescription || '',
            lifestyle: p.lifestyle || [],
            languages: (p.languages || []).join(', '),
            socials: {
              instagram: p.socials?.instagram || '',
              twitter: p.socials?.twitter || '',
              linkedin: p.socials?.linkedin || '',
              tiktok: p.socials?.tiktok || '',
              email: p.socials?.email || '',
              website: p.socials?.website || '',
            },
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function updateProfile(updates: Partial<ProfileData>) {
    setProfile((p) => ({ ...p, ...updates }))
  }

  function toggleArrayItem(arr: string[], item: string): string[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const body = {
        firstName: profile.firstName,
        age: parseInt(profile.age),
        bio: profile.bio,
        pronouns: profile.pronouns,
        genderIdentity: profile.genderIdentity || undefined,
        seeking: profile.seeking,
        currentLocation: profile.currentLocation.city
          ? { ...profile.currentLocation, updatedAt: new Date().toISOString() }
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

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
      } else {
        setSuccess('Profile saved!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    setSaving(true)
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await fetch('/api/profile/photos', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        updateProfile({ photos: [...profile.photos, data.url] })
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
            ← Back to Browse
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--nm-black)' }}>Edit Profile</h1>

        {error && (
          <div className="p-4 rounded-lg text-sm mb-6" style={{ background: '#FFF0F0', color: 'var(--nm-red)', border: '1px solid #FFCCCC' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 rounded-lg text-sm mb-6" style={{ background: '#F0FFF4', color: '#166534', border: '1px solid #BBF7D0' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* About */}
          <section>
            <h2 className="text-lg font-bold mb-4 pb-2" style={{ color: 'var(--nm-black)', borderBottom: '1px solid #E8E8E8' }}>About You</h2>
            <div className="space-y-4">
              <div>
                <label className="form-label">First name</label>
                <input type="text" className="form-input" value={profile.firstName} onChange={(e) => updateProfile({ firstName: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Age</label>
                <input type="number" className="form-input" value={profile.age} onChange={(e) => updateProfile({ age: e.target.value })} min="18" style={{ maxWidth: '8rem' }} />
              </div>
              <div>
                <label className="form-label">Bio</label>
                <textarea className="form-input" rows={4} value={profile.bio} onChange={(e) => updateProfile({ bio: e.target.value })} maxLength={500} style={{ resize: 'vertical' }} />
                <p className="text-xs mt-1" style={{ color: '#9B9B9B' }}>{profile.bio.length}/500</p>
              </div>
              <div>
                <label className="form-label">Pronouns</label>
                <input type="text" className="form-input" value={profile.pronouns} onChange={(e) => updateProfile({ pronouns: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Gender identity</label>
                <select className="form-input" value={profile.genderIdentity} onChange={(e) => updateProfile({ genderIdentity: e.target.value })}>
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
                <label className="form-label">I&apos;m open to dating</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SEEKING_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button"
                      onClick={() => updateProfile({ seeking: toggleArrayItem(profile.seeking, opt.value) })}
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{ background: profile.seeking.includes(opt.value) ? 'var(--nm-red)' : 'var(--nm-gray)', color: profile.seeking.includes(opt.value) ? 'white' : 'var(--nm-black)' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Photos */}
          <section>
            <h2 className="text-lg font-bold mb-4 pb-2" style={{ color: 'var(--nm-black)', borderBottom: '1px solid #E8E8E8' }}>Photos</h2>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {profile.photos.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden" style={{ background: 'var(--nm-gray)' }}>
                  <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                  <button type="button" onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ background: 'rgba(0,0,0,0.6)' }}>✕</button>
                </div>
              ))}
              {profile.photos.length < 10 && (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-xs"
                  style={{ background: 'var(--nm-gray)', color: 'var(--nm-muted)', border: '2px dashed #D0D0D0' }}>
                  <span className="text-xl">+</span>Add
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
          </section>

          {/* Location */}
          <section>
            <h2 className="text-lg font-bold mb-4 pb-2" style={{ color: 'var(--nm-black)', borderBottom: '1px solid #E8E8E8' }}>Location</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label">City</label>
                <input type="text" className="form-input" value={profile.currentLocation.city}
                  onChange={(e) => updateProfile({ currentLocation: { ...profile.currentLocation, city: e.target.value } })} />
              </div>
              <div>
                <label className="form-label">Country</label>
                <input type="text" className="form-input" value={profile.currentLocation.country}
                  onChange={(e) => updateProfile({ currentLocation: { ...profile.currentLocation, country: e.target.value } })} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <label className="form-label" style={{ marginBottom: 0 }}>Travel plans</label>
              <button type="button" onClick={addTravelPlan} className="text-sm font-semibold" style={{ color: 'var(--nm-red)' }}>+ Add</button>
            </div>
            {profile.travelPlans.map((plan, idx) => (
              <div key={idx} className="card p-4 mb-3">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input type="text" className="form-input" placeholder="Destination" value={plan.destination}
                    onChange={(e) => updateTravelPlan(idx, { destination: e.target.value })} />
                  <input type="text" className="form-input" placeholder="Country code" value={plan.countryCode}
                    onChange={(e) => updateTravelPlan(idx, { countryCode: e.target.value.toUpperCase().slice(0, 2) })} maxLength={2} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" className="form-input" value={plan.startDate}
                    onChange={(e) => updateTravelPlan(idx, { startDate: e.target.value })} />
                  <input type="date" className="form-input" value={plan.endDate}
                    onChange={(e) => updateTravelPlan(idx, { endDate: e.target.value })} />
                </div>
              </div>
            ))}
          </section>

          {/* Work */}
          <section>
            <h2 className="text-lg font-bold mb-4 pb-2" style={{ color: 'var(--nm-black)', borderBottom: '1px solid #E8E8E8' }}>Work & Lifestyle</h2>
            <div className="space-y-4">
              <div>
                <label className="form-label">Work style</label>
                <select className="form-input" value={profile.workStyle} onChange={(e) => updateProfile({ workStyle: e.target.value })}>
                  <option value="">Select...</option>
                  <option value="fully-remote">Fully remote</option>
                  <option value="freelance">Freelancer</option>
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="content-creator">Content creator</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">What you do</label>
                <input type="text" className="form-input" value={profile.workDescription} onChange={(e) => updateProfile({ workDescription: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Lifestyle</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {LIFESTYLE_OPTIONS.map((opt) => (
                    <button key={opt} type="button"
                      onClick={() => updateProfile({ lifestyle: toggleArrayItem(profile.lifestyle, opt) })}
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{ background: profile.lifestyle.includes(opt) ? 'var(--nm-red)' : 'var(--nm-gray)', color: profile.lifestyle.includes(opt) ? 'white' : 'var(--nm-black)' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Languages</label>
                <input type="text" className="form-input" value={profile.languages} onChange={(e) => updateProfile({ languages: e.target.value })} placeholder="English, Spanish" />
              </div>
            </div>
          </section>

          {/* Socials */}
          <section>
            <h2 className="text-lg font-bold mb-4 pb-2" style={{ color: 'var(--nm-black)', borderBottom: '1px solid #E8E8E8' }}>Connect</h2>
            <div className="space-y-4">
              {(['instagram', 'twitter', 'linkedin', 'tiktok', 'email', 'website'] as const).map((key) => (
                <div key={key}>
                  <label className="form-label capitalize">{key === 'twitter' ? 'X / Twitter' : key}</label>
                  <input type="text" className="form-input" value={profile.socials[key]}
                    onChange={(e) => updateProfile({ socials: { ...profile.socials, [key]: e.target.value } })} />
                </div>
              ))}
            </div>
          </section>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="btn-primary py-3 px-8" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <Link href="/browse" className="btn-outline py-3 px-6">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
