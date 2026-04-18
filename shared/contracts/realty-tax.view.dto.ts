import { z } from 'zod'

export const RealtyTaxViewDtoSchema = z.object({
  stateTaxId: z.string(),
  ownershipRegistrationDate: z.coerce.date(),
  ownershipTerminationDate: z.coerce.date().nullable(),
  taxpayerName: z.string(),
  objectType: z.string(),
  objectAddress: z.string(),
  totalArea: z.number(),
  exemptAreaM2: z.number(),
  taxableAreaM2: z.number(),
  minWageUah: z.number(),
  taxRate: z.number(),
  ownershipShare: z.number(),
  baseTaxUah: z.number(),
  luxuryTaxUah: z.number(),
  annualTaxUah: z.number(),
  validationStatus: z.string().nullable(),
})

export type RealtyTaxViewDto = z.infer<typeof RealtyTaxViewDtoSchema>
