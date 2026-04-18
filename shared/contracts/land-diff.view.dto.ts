import { z } from 'zod'

export const LandDiffViewDtoSchema = z.object({
  cadastralNumber: z.string(),
  diffStatus: z.string(),
  registryTaxId: z.string().nullable(),
  registryUser: z.string().nullable(),
  registrySquare: z.number().nullable(),
  registryEstimateValue: z.number().nullable(),
  registryLocation: z.string().nullable(),
  crmTaxId: z.string().nullable(),
  crmUser: z.string().nullable(),
  crmSquare: z.number().nullable(),
  crmEstimateValue: z.number().nullable(),
  crmLocation: z.string().nullable(),
})

export interface LandDiffViewDto extends z.infer<typeof LandDiffViewDtoSchema> {}
