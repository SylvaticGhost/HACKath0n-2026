import { z } from 'zod'
import { BaseRealtyDtoSchema } from './realty.base.dto'

export const RealtyRegistryDtoSchema = BaseRealtyDtoSchema

export interface RealtyRegistryDto extends z.infer<typeof RealtyRegistryDtoSchema> {}
