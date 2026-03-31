import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Profile from '@/models/Profile'
import CompatibilityTest from '@/models/CompatibilityTest'
import { getSession } from '@/lib/auth'

export async function DELETE() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    // Delete all user data
    await Profile.deleteOne({ userId: session.sub })
    await CompatibilityTest.deleteOne({ userId: session.sub })
    await User.findByIdAndDelete(session.sub)

    const response = NextResponse.json({ success: true })
    response.cookies.delete('nm_token')
    response.cookies.delete('nm_sub')
    response.cookies.delete('nm_profile')

    return response
  } catch (err) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
