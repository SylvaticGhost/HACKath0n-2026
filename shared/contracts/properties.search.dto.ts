import { z } from 'zod'

export const LandSearchSchema = z.object({
  cadastralNumber: z.string().optional(),
  stateTaxId: z.string().optional(),
  user: z.string().optional(),
  location: z.string().optional(),
})

export type LandSearchDto = z.infer<typeof LandSearchSchema>

export const RealtySearchSchema = z.object({
  stateTaxId: z.string().optional(),
  taxpayerName: z.string().optional(),
  objectAddress: z.string().optional(),
})

export type RealtySearchDto = z.infer<typeof RealtySearchSchema>
