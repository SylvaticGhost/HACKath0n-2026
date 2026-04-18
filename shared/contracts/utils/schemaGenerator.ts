import { z } from 'zod'

export function resultSchema(dataSchema: any) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  })
}
