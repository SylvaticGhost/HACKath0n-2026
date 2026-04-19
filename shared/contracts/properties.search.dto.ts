import { z } from 'zod'

export const LandSearchSchema = z.object({
  cadastralNumber: z.string().optional(),
  stateTaxId: z.string().optional(),
  user: z.string().optional(),
  location: z.string().optional(),
  squareMin: z.coerce.number().optional(),
  squareMax: z.coerce.number().optional(),
  estimateValueMin: z.coerce.number().optional(),
  estimateValueMax: z.coerce.number().optional(),
  validationStatus: z.string().optional(),
})

export type LandSearchDto = z.infer<typeof LandSearchSchema>

export const RealtySearchSchema = z.object({
  stateTaxId: z.string().optional(),
  taxpayerName: z.string().optional(),
  objectAddress: z.string().optional(),
  totalAreaMin: z.coerce.number().optional(),
  totalAreaMax: z.coerce.number().optional(),
  ownershipShareMin: z.coerce.number().optional(),
  ownershipShareMax: z.coerce.number().optional(),
  validationStatus: z.string().optional(),
})

export type RealtySearchDto = z.infer<typeof RealtySearchSchema>

export const LocationSuggestionSchema = z.object({
  query: z.string().min(3, 'query must be at least 3 characters'),
  limit: z.coerce.number().int().positive().optional(),
})

export type LocationSuggestionDto = z.infer<typeof LocationSuggestionSchema>
