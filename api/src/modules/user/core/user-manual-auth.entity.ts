import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm'
import { User } from './user.entity'

@Entity('manual_auth', { schema: 'user_schema' })
export class UserManualAuth {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string

  @Column({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date

  @Column({ type: 'varchar', name: 'password_hash' })
  private passwordHash: string

  @OneToOne(() => User, (user) => user.manualAuth)
  @JoinColumn({ name: 'user_id' })
  user: User

  constructor(userId: string, passwordHash: string, updatedAt: Date) {
    this.userId = userId
    this.passwordHash = passwordHash
    this.updatedAt = updatedAt
  }

  get password(): string {
    return this.passwordHash
  }

  static createForUser(user: User, passwordHash: string): UserManualAuth {
    return new UserManualAuth(user.id, passwordHash, new Date())
  }

  setPassword(passwordHash: string): void {
    this.passwordHash = passwordHash
  }
}
