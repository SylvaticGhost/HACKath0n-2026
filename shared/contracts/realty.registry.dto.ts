import { z } from 'zod'

export const RealtyRegistryDtoSchema = z.object({
  stateTaxId: z.string(),
  ownershipRegistrationDate: z.date(),
  taxpayerName: z.string(),
  objectType: z.string(),
  objectAddress: z.string(),
  ownershipTerminationDate: z.date().nullable().optional(),
  totalArea: z.number(),
  jointOwnershipType: z.string().nullable().optional(),
  ownershipShare: z.number().nullable().optional(),
})

export interface RealtyRegistryDto extends z.infer<typeof RealtyRegistryDtoSchema> {}
