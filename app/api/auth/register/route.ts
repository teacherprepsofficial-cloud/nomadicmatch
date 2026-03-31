import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { signJWT } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName } = await request.json()

    if (!email || !password || !firstName) {
      return NextResponse.json(
        { error: 'Email, password, and first name are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    await connectDB()

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Generate unique username
    const base = firstName.toLowerCase().replace(/[^a-z0-9]/g, '')
    const suffix = Math.floor(1000 + Math.random() * 9000)
    let username = `${base}${suffix}`

    // Ensure uniqueness
    let usernameExists = await User.findOne({ username })
    let attempts = 0
    while (usernameExists && attempts < 5) {
      const newSuffix = Math.floor(1000 + Math.random() * 9000)
      username = `${base}${newSuffix}`
      usernameExists = await User.findOne({ username })
      attempts++
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // First 100 signups are free
    const totalUsers = await User.countDocuments()
    const isFree = totalUsers < 100

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      username,
      subscription: isFree
        ? { status: 'active', stripeSubscriptionId: 'free_founding_member' }
        : { status: 'none' },
      profileComplete: false,
    })

    const token = signJWT({
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
    })

    const response = NextResponse.json({ username: user.username, isFree }, { status: 201 })
    response.cookies.set('nm_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    // Sub status cookie (readable by middleware on Edge)
    response.cookies.set('nm_sub', isFree ? 'active' : 'none', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    response.cookies.set('nm_profile', 'false', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
