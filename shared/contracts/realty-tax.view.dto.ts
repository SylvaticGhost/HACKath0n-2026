import { z } from 'zod'

export const RealtyTaxViewDtoSchema = z.object({
  stateTaxId: z.string(),
  ownershipRegistrationDate: z.coerce.date(),
  taxpayerName: z.string(),
  objectType: z.string(),
  objectAddress: z.string(),
  totalArea: z.number(),
  ownershipShare: z.number(),
  baseTaxUah: z.number(),
  luxuryTaxUah: z.number(),
  annualTaxUah: z.number(),
  validationStatus: z.string().nullable(),
})

export type RealtyTaxViewDto = z.infer<typeof RealtyTaxViewDtoSchema>
