import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Profile from '@/models/Profile'
import User from '@/models/User'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    await connectDB()

    // userId can be a MongoDB ObjectId or a username
    let profile = null

    // Try finding by username first
    const user = await User.findOne({ username: userId })
    if (user) {
      profile = await Profile.findOne({ userId: user._id })
    } else {
      // Try by ObjectId
      profile = await Profile.findOne({ userId: userId })
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (err) {
    console.error('Get profile by userId error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
