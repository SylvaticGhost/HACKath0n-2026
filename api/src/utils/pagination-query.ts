import { Result } from 'shared'
import { z } from 'zod'

export interface PaginationQuery {
  page: number
  pageSize: number
}

const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(10),
})

export function parsePaginationQuery(page?: string, pageSize?: string): Result<PaginationQuery> {
  const parsed = PaginationQuerySchema.safeParse({
    page,
    pageSize,
  })

  if (!parsed.success) {
    const errorMessage = parsed.error.issues.map((issue) => issue.message).join('; ')
    return Result.badRequest(errorMessage || 'Invalid pagination query parameters')
  }

  return Result.success(parsed.data)
}
