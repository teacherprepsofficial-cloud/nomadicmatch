import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Profile from '@/models/Profile'
import CompatibilityTest from '@/models/CompatibilityTest'
import { getSession } from '@/lib/auth'
import { computeCompatibility } from '@/lib/compatibility'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const seekingFilter = searchParams.get('seeking')
    const countryFilter = searchParams.get('country')
    const workStyleFilter = searchParams.get('workStyle')

    await connectDB()

    const query: Record<string, unknown> = {
      isVisible: true,
      userId: { $ne: session.sub },
    }

    if (seekingFilter) {
      query.seeking = { $in: [seekingFilter] }
    }

    if (countryFilter) {
      query['currentLocation.country'] = {
        $regex: countryFilter,
        $options: 'i',
      }
    }

    if (workStyleFilter) {
      query.workStyle = workStyleFilter
    }

    const total = await Profile.countDocuments(query)
    const profiles = await Profile.find(query)
      .sort({ lastActive: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Try to attach compatibility scores if the viewer has taken the test
    const myTest = await CompatibilityTest.findOne({ userId: session.sub }).lean()

    const profilesWithScores = profiles.map((profile) => {
      const profileObj = { ...profile }

      if (myTest?.categoryScores) {
        // We'd need to fetch each user's test — do it lazily via a separate batch
        // For now, mark that scores are not yet loaded; the browse page can request them
      }

      return profileObj
    })

    // If viewer has a test, batch-fetch all test scores for the returned profiles
    if (myTest?.categoryScores) {
      const userIds = profiles.map((p) => p.userId)
      const theirTests = await CompatibilityTest.find({
        userId: { $in: userIds },
      }).lean()

      const testByUserId = new Map(
        theirTests.map((t) => [t.userId.toString(), t])
      )

      const scoredProfiles = profilesWithScores.map((profile) => {
        const theirTest = testByUserId.get(profile.userId.toString())
        if (theirTest?.categoryScores) {
          const score = computeCompatibility(
            myTest.categoryScores,
            theirTest.categoryScores
          )
          return { ...profile, compatibilityScore: score }
        }
        return profile
      })

      // Sort by compatibility score desc, then lastActive
      scoredProfiles.sort((a, b) => {
        const scoreA = (a as { compatibilityScore?: number }).compatibilityScore ?? -1
        const scoreB = (b as { compatibilityScore?: number }).compatibilityScore ?? -1
        return scoreB - scoreA
      })

      return NextResponse.json({
        profiles: scoredProfiles,
        total,
        page,
        pages: Math.ceil(total / limit),
      })
    }

    return NextResponse.json({
      profiles: profilesWithScores,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('Browse error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
