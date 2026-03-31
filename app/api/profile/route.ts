import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Profile from '@/models/Profile'
import User from '@/models/User'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const profile = await Profile.findOne({ userId: session.sub })
    if (!profile) {
      return NextResponse.json({ profile: null })
    }

    return NextResponse.json({ profile })
  } catch (err) {
    console.error('Get profile error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()

    // Remove fields that shouldn't be updated directly
    delete body.userId
    delete body._id
    delete body.photos // photos managed separately

    const profile = await Profile.findOneAndUpdate(
      { userId: session.sub },
      {
        ...body,
        userId: session.sub,
        lastActive: new Date(),
        updatedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true }
    )

    // Check if profile is complete enough to mark profileComplete on User
    const isComplete =
      profile.firstName &&
      profile.age >= 18 &&
      profile.photos &&
      profile.photos.length > 0

    if (isComplete) {
      await User.findByIdAndUpdate(session.sub, { profileComplete: true })
    }

    return NextResponse.json({ profile })
  } catch (err) {
    console.error('Update profile error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
