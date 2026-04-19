import { z } from 'zod'
import { BaseRealtyDtoSchema } from './realty.base.dto'
import { PropertyInfoSchema } from './property-info.dto'

export const RealtyCrmDtoSchema = BaseRealtyDtoSchema.extend({
  propertyInfo: PropertyInfoSchema,
})

export interface RealtyCrmDto extends z.infer<typeof RealtyCrmDtoSchema> {}

export const UpdateRealtyCrmDtoSchema = RealtyCrmDtoSchema.omit({
  stateTaxId: true,
  ownershipRegistrationDate: true,
})

export interface UpdateRealtyCrmDto extends z.infer<typeof UpdateRealtyCrmDtoSchema> {}
