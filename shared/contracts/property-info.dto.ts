import { z } from 'zod'

export const PropertyInfoSchema = z.object({
  email: z.string().nullable(),
  phone: z.string().nullable(),
})

export type PropertyInfo = z.infer<typeof PropertyInfoSchema>
