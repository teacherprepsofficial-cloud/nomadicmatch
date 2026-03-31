import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error('Please define JWT_SECRET in .env.local')
}

export interface JWTPayload {
  sub: string
  email: string
  username: string
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload & {
      iat: number
      exp: number
    }
    return {
      sub: decoded.sub,
      email: decoded.email,
      username: decoded.username,
    }
  } catch {
    return null
  }
}
