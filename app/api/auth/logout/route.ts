import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('nm_token')
  response.cookies.delete('nm_sub')
  response.cookies.delete('nm_profile')
  return response
}
