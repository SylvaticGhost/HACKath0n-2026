import { Result } from 'shared'

export async function handleDuplicateKeyError(fn: () => Promise<any>): Promise<Result<void>> {
  try {
    await fn()
    return Result.success(undefined)
  } catch (error) {
    if (error.code === '23505') {
      return Result.badRequest('Duplicate key error: A record with the same unique identifier already exists.')
    }
    throw error
  }
}
