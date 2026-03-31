import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Profile from '@/models/Profile'

export async function GET() {
  try {
    await connectDB()

    const totalUsers = await User.countDocuments()
    const freeSpotsTaken = Math.min(totalUsers, 100)
    const freeSpotsLeft = Math.max(0, 100 - totalUsers)

    const recentProfiles = await Profile.find({ isVisible: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .select('firstName photos currentLocation')
      .lean()

    const members = recentProfiles.map((p) => ({
      firstName: p.firstName,
      photo: p.photos?.[0]?.url || null,
      city: p.currentLocation?.city || null,
      country: p.currentLocation?.country || null,
    }))

    return NextResponse.json({
      totalUsers,
      freeSpotsTaken,
      freeSpotsLeft,
      isFreeActive: totalUsers < 100,
      members,
    })
  } catch (err) {
    console.error('Stats error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
