import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
]

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  if (pathname.startsWith('/api/auth/')) return true
  if (pathname.startsWith('/api/homepage/')) return true
  if (pathname === '/api/stripe/webhook') return true
  if (pathname.startsWith('/_next/')) return true
  if (pathname.startsWith('/uploads/')) return true
  if (pathname.includes('.')) return true // static files
  return false
}

interface TokenPayload {
  sub: string
  email: string
  username: string
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get('nm_token')?.value

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  let payload: TokenPayload
  try {
    const { payload: decoded } = await jwtVerify(token, JWT_SECRET)
    payload = decoded as unknown as TokenPayload
  } catch {
    const loginUrl = new URL('/login', request.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('nm_token')
    return response
  }

  // Check subscription status from cookie-embedded payload
  // We need to check the DB for subscription status — but middleware runs on Edge,
  // so we store subscription info in a separate cookie set at login time.
  const subStatus = request.cookies.get('nm_sub')?.value || 'none'
  const profileComplete = request.cookies.get('nm_profile')?.value === 'true'

  // If no active subscription and not on subscribe pages
  if (
    subStatus !== 'active' &&
    !pathname.startsWith('/subscribe')
  ) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 403 })
    }
    const subscribeUrl = new URL('/subscribe', request.url)
    return NextResponse.redirect(subscribeUrl)
  }

  // If subscription active but profile not complete and not on onboarding
  if (
    subStatus === 'active' &&
    !profileComplete &&
    !pathname.startsWith('/onboarding')
  ) {
    const onboardingUrl = new URL('/onboarding', request.url)
    return NextResponse.redirect(onboardingUrl)
  }

  // Add user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.sub)
  requestHeaders.set('x-user-email', payload.email)
  requestHeaders.set('x-user-username', payload.username)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|uploads/).*)',
  ],
}
