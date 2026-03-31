import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import connectDB from '@/lib/mongodb'
import Profile from '@/models/Profile'
import { getSession } from '@/lib/auth'

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

async function ensureUploadsDir() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await ensureUploadsDir()
    await connectDB()

    const formData = await request.formData()
    const file = formData.get('photo') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${session.sub}_${Date.now()}.${ext}`
    const filepath = path.join(UPLOADS_DIR, filename)

    await writeFile(filepath, buffer)

    const url = `/uploads/${filename}`

    // Add photo to profile
    const profile = await Profile.findOne({ userId: session.sub })

    if (!profile) {
      // Create minimal profile with this photo
      await Profile.create({
        userId: session.sub,
        firstName: '',
        age: 18,
        photos: [{ url, order: 0, uploadedAt: new Date() }],
      })
    } else {
      const order = profile.photos.length
      profile.photos.push({ url, order, uploadedAt: new Date() })
      await profile.save()
    }

    return NextResponse.json({ url }, { status: 201 })
  } catch (err) {
    console.error('Photo upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const { photoIndex } = await request.json()

    if (photoIndex === undefined || photoIndex === null) {
      return NextResponse.json({ error: 'photoIndex is required' }, { status: 400 })
    }

    const profile = await Profile.findOne({ userId: session.sub })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    profile.photos.splice(photoIndex, 1)

    // Re-order remaining photos
    profile.photos.forEach((photo, idx) => {
      photo.order = idx
    })

    await profile.save()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Photo delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
