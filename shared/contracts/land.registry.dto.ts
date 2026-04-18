import { z } from 'zod'
import { BaseLandDtoSchema } from './land.base.dto'

export const LandRegistryDtoSchema = BaseLandDtoSchema

export interface LandRegistryDto extends z.infer<typeof LandRegistryDtoSchema> {}
