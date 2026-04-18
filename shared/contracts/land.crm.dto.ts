import { z } from 'zod'
import { BaseLandDtoSchema } from './land.base.dto'

export const LandCrmDtoSchema = BaseLandDtoSchema

export interface LandCrmDto extends z.infer<typeof LandCrmDtoSchema> {}

export const UpdateLandCrmDtoSchema = BaseLandDtoSchema.omit({ cadastralNumber: true })

export interface UpdateLandCrmDto extends z.infer<typeof UpdateLandCrmDtoSchema> {}
