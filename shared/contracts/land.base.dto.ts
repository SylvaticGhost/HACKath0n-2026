import { z } from 'zod'

export const BaseLandDtoSchema = z.object({
  cadastralNumber: z.string(),
  koatuu: z.string(),
  ownershipType: z.string(),
  intendedPurpose: z.string(),
  location: z.string(),
  landPurposeType: z.string(),
  square: z.number(),
  estimateValue: z.number(),
  stateTaxId: z.string(),
  user: z.string(),
  ownerPart: z.number().nullable().optional(),
  stateRegistrationDate: z.date(),
  ownershipRegistrationId: z.string(),
  registrator: z.string(),
  type: z.string(),
  subtype: z.string(),
})
