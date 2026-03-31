import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getSession } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await connectDB()

    const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: session.sub } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    await User.findByIdAndUpdate(session.sub, { email: email.toLowerCase() })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Change email error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
