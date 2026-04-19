import { z } from 'zod'
import { BaseLandDtoSchema } from './land.base.dto'
import { PropertyInfoSchema } from './property-info.dto'

export const LandCrmDtoSchema = BaseLandDtoSchema.extend({
  propertyInfo: PropertyInfoSchema,
})

export interface LandCrmDto extends z.infer<typeof LandCrmDtoSchema> {}

export const UpdateLandCrmDtoSchema = LandCrmDtoSchema.omit({ cadastralNumber: true })

export interface UpdateLandCrmDto extends z.infer<typeof UpdateLandCrmDtoSchema> {}
