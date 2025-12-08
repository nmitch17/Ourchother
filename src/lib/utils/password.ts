import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.CLIENT_JWT_SECRET!

// Hash a password for storage
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verify a password against its hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate a JWT token for client dashboard sessions
export function generateClientToken(projectId: string): string {
  return jwt.sign({ projectId }, JWT_SECRET, { expiresIn: '7d' })
}

// Verify and decode a client token
export function verifyClientToken(token: string): { projectId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { projectId: string }
  } catch {
    return null
  }
}
