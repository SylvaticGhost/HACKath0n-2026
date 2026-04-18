import { z } from 'zod'

export const LandTaxViewDtoSchema = z.object({
  cadastralNumber: z.string(),
  stateTaxId: z.string(),
  taxpayerType: z.enum(['individual', 'legal_entity']),
  user: z.string(),
  location: z.string(),
  landPurposeType: z.string(),
  ownershipType: z.string(),
  square: z.number(),
  ngoUah: z.number(),
  indexationCoefficient: z.number(),
  taxRate: z.number(),
  ownerPart: z.number(),
  annualTaxUah: z.number().nullable(),
  validationStatus: z.string().nullable(),
})

export type LandTaxViewDto = z.infer<typeof LandTaxViewDtoSchema>
