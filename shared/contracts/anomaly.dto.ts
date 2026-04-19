import { z } from 'zod'

export const AnomalyDtoSchema = z.object({
  id: z.number(),
  cadastralNumber: z.string().nullable(),
  landAddress: z.string().nullable(),
  realtyAddress: z.string().nullable(),
  matchScore: z.number().nullable(),
  matchReason: z.string().nullable(),
  status: z.string(),
})

export type AnomalyDto = z.infer<typeof AnomalyDtoSchema>
