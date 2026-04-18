import { z } from 'zod'
import { BaseLandDtoSchema } from './land.base.dto'

export const LandCrmDtoSchema = BaseLandDtoSchema

export interface LandCrmDto extends z.infer<typeof LandCrmDtoSchema> {}
