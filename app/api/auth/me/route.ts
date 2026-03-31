import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.sub)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      _id: user._id.toString(),
      email: user.email,
      username: user.username,
      subscription: user.subscription,
      profileComplete: user.profileComplete,
      createdAt: user.createdAt,
    })
  } catch (err) {
    console.error('Me error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
