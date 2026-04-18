import { z } from 'zod'
import { BaseRealtyDtoSchema } from './realty.base.dto'

export const RealtyCrmDtoSchema = BaseRealtyDtoSchema

export interface RealtyCrmDto extends z.infer<typeof RealtyCrmDtoSchema> {}

export const UpdateRealtyCrmDtoSchema = BaseRealtyDtoSchema.omit({
  stateTaxId: true,
  ownershipRegistrationDate: true,
})

export interface UpdateRealtyCrmDto extends z.infer<typeof UpdateRealtyCrmDtoSchema> {}
