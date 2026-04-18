import { z } from 'zod'
import { BaseRealtyDtoSchema } from './realty.base.dto'

export const RealtyCrmDtoSchema = BaseRealtyDtoSchema

export interface RealtyCrmDto extends z.infer<typeof RealtyCrmDtoSchema> {}
