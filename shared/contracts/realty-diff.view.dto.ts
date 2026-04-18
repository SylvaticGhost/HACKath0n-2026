import { z } from 'zod'

export const RealtyDiffViewDtoSchema = z.object({
  stateTaxId: z.string(),
  ownershipRegistrationDate: z.coerce.date(),
  diffStatus: z.string(),
  registryTaxpayerName: z.string().nullable(),
  registryAddress: z.string().nullable(),
  registryTotalArea: z.number().nullable(),
  registryOwnershipShare: z.number().nullable(),
  crmTaxpayerName: z.string().nullable(),
  crmAddress: z.string().nullable(),
  crmTotalArea: z.number().nullable(),
  crmOwnershipShare: z.number().nullable(),
  similarityScore: z.number().nullable(),
})

export interface RealtyDiffViewDto extends z.infer<typeof RealtyDiffViewDtoSchema> {}
