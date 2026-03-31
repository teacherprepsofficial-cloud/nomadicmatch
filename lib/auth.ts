import { cookies } from 'next/headers'
import { verifyJWT, type JWTPayload } from './jwt'

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('nm_token')?.value
  if (!token) return null
  return verifyJWT(token)
}
