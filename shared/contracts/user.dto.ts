import { z } from 'zod'
import { PASSWORD_RULES } from '../consts'

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string().optional(),
  email: z.string().optional(),
  createdAt: z.string().datetime(),
  avatarUrl: z.string().url().optional(),
})

export const UserLoggedSchema = z.object({
  user: UserSchema,
  jwt: z.string(),
})

export const CreatedUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string().optional(),
  email: z.string().optional(),
  plainPassword: z.string(),
})

export const ResultUserSchema = z.object({
  statusCode: z.number(),
  errorMessage: z.string().optional(),
  value: UserSchema.optional(),
})

export const ResultCreatedUserSchema = z.object({
  statusCode: z.number(),
  errorMessage: z.string().optional(),
  value: CreatedUserSchema.optional(),
})

export const ResultUserLoggedSchema = z.object({
  statusCode: z.number(),
  errorMessage: z.string().optional(),
  value: UserLoggedSchema.optional(),
})

export type UserDto = z.infer<typeof UserSchema>
export type UserCreatedDto = z.infer<typeof CreatedUserSchema>
export type UserLoggedDto = z.infer<typeof UserLoggedSchema>
export type ResultUserDto = z.infer<typeof ResultUserSchema>
export type ResultCreatedUserDto = z.infer<typeof ResultCreatedUserSchema>

export const UserCreateSchema = z.object({
  email: z.string().email(),
  display_name: z.string().optional(),
  manuallyDefinedUsername: z.string().optional(),
  avatar: z.string().url().optional(),
  password: z.string().min(PASSWORD_RULES.minLength).max(PASSWORD_RULES.maxLength).optional(),
})

export type UserCreateDto = z.infer<typeof UserCreateSchema>

export const UserLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(PASSWORD_RULES.minLength, 'Password must be at least 8 characters'),
})

export type UserLoginDto = z.infer<typeof UserLoginSchema>
