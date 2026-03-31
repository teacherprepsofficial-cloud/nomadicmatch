import { NextResponse } from 'next/server'

function clearCookies(response: NextResponse) {
  response.cookies.delete('nm_token')
  response.cookies.delete('nm_sub')
  response.cookies.delete('nm_profile')
  return response
}

export async function POST() {
  return clearCookies(NextResponse.json({ success: true }))
}

// GET so users can visit /api/auth/logout directly in browser
export async function GET() {
  const response = NextResponse.redirect(new URL('https://nomadicmatch.com/register'))
  return clearCookies(response)
}
