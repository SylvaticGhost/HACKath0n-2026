import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'

export class PasswordHelper {
  static generateSecurePassword(length = 12): string {
    return crypto.randomBytes(length).toString('base64url').slice(0, length)
  }

  static guardPassword(password: string): string {
    if (!password || password.length === 0) throw new Error('Password is required')
    if (password.length < 8) throw new Error('Password must be at least 8 characters')
    if (password.length > 32) throw new Error('Password must be at most 32 characters')
    return password
  }

  static async hashPassword(password: string): Promise<string> {
    this.guardPassword(password)

    const salt = await bcrypt.genSalt()
    return bcrypt.hash(password, salt)
  }

  static async comparePasswords(password: string, passwordHash: string): Promise<boolean> {
    this.guardPassword(password)

    if (!passwordHash || passwordHash.length === 0) throw new Error('Hashed password is not provided')

    return bcrypt.compare(password, passwordHash)
  }
}
