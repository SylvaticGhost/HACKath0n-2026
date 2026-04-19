import { z } from 'zod'

export const BaseRealtyDtoSchema = z.object({
  stateTaxId: z.string(),
  ownershipRegistrationDate: z.coerce.date(),
  taxpayerName: z.string(),
  objectType: z.string(),
  objectAddress: z.string(),
  ownershipTerminationDate: z.coerce.date().nullable().optional(),
  totalArea: z.number(),
  jointOwnershipType: z.string().nullable().optional(),
  ownershipShare: z.number().nullable().optional(),
  validationStatus: z.string().nullable().optional(),
})
