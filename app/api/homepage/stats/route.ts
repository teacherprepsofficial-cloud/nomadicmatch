import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Profile from '@/models/Profile'

export async function GET() {
  try {
    await connectDB()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentUserCount = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    const recentProfiles = await Profile.find({ isVisible: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('firstName photos currentLocation')
      .lean()

    const members = recentProfiles.map((p) => ({
      firstName: p.firstName,
      photo: p.photos?.[0]?.url || null,
      city: p.currentLocation?.city || null,
      country: p.currentLocation?.country || null,
    }))

    return NextResponse.json({ recentCount: recentUserCount, members })
  } catch (err) {
    console.error('Stats error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
