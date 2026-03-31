import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import CompatibilityTest from '@/models/CompatibilityTest'
import Profile from '@/models/Profile'
import { getSession } from '@/lib/auth'
import { computeCategoryScores } from '@/lib/compatibility'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectDB()

    const test = await CompatibilityTest.findOne({ userId: session.sub })
    return NextResponse.json({ test: test || null })
  } catch (err) {
    console.error('Get compatibility error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { answers } = await request.json()

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 })
    }

    await connectDB()

    const categoryScores = computeCategoryScores(answers)

    const test = await CompatibilityTest.findOneAndUpdate(
      { userId: session.sub },
      {
        userId: session.sub,
        answers,
        categoryScores,
        completedAt: new Date(),
        version: 1,
      },
      { upsert: true, new: true }
    )

    // Link test to profile
    await Profile.findOneAndUpdate(
      { userId: session.sub },
      { compatibilityTestId: test._id }
    )

    return NextResponse.json({ test, categoryScores })
  } catch (err) {
    console.error('Submit compatibility error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
