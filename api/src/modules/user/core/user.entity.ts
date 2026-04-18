import { Entity, Column, OneToOne, PrimaryColumn } from 'typeorm'
import { UserManualAuth } from './user-manual-auth.entity'
import { v4 as uuidv4 } from 'uuid'
import { UserCreatedDto, UserCreateDto, UserDto } from 'shared/contracts'

export interface UserPayload {
  id: string
  email?: string
  username: string
  displayName?: string
}

@Entity('users', { schema: 'user_schema' })
export class User {
  @PrimaryColumn('uuid')
  id: string

  @Column({ type: 'varchar', unique: true, nullable: true })
  email?: string | undefined

  @Column({ type: 'varchar', unique: true })
  username: string

  @Column({ type: 'varchar', nullable: true, name: 'display_name' })
  displayName: string | undefined

  @Column({ type: 'timestamp', name: 'created_at' })
  createdAt: Date

  @Column({ type: 'varchar', nullable: true })
  avatar?: string

  @OneToOne(() => UserManualAuth, (manualAuth) => manualAuth.user, {
    nullable: true,
    cascade: true,
  })
  manualAuth?: UserManualAuth

  constructor(
    id: string,
    email: string | undefined,
    username: string,
    display_name: string | undefined,
    created_at: Date,
    avatar?: string,
  ) {
    this.id = id
    this.email = email
    this.username = username
    this.displayName = display_name
    this.createdAt = created_at
    this.avatar = avatar
  }

  public static create(dto: UserCreateDto, username: string, hashedPassword: string): User {
    const id = uuidv4()

    const user = new User(id, dto.email, username, dto.display_name, new Date(), dto.avatar)

    user.manualAuth = UserManualAuth.createForUser(user, hashedPassword)

    return user
  }

  asDto(): UserDto {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      displayName: this.displayName,
      createdAt: this.createdAt.toISOString(),
      avatarUrl: this.avatar,
    }
  }

  asCreatedDto(plainPassword: string): UserCreatedDto {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      displayName: this.displayName,
      plainPassword,
    }
  }

  asPayload(): UserPayload {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      displayName: this.displayName,
    }
  }

  static suggestUsername(email: string): string {
    return email.split('@')[0]
  }
}
