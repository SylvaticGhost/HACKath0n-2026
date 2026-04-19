import { z } from 'zod'
import { AnomalyDtoSchema } from './anomaly.dto'
import { LandCrmDtoSchema } from './land.crm.dto'
import { RealtyCrmDtoSchema } from './realty.crm.dto'

export const AnomalyDetailsDtoSchema = z.object({
  anomaly: AnomalyDtoSchema,
  land: LandCrmDtoSchema.nullable(),
  realty: z.array(RealtyCrmDtoSchema),
})

export type AnomalyDetailsDto = z.infer<typeof AnomalyDetailsDtoSchema>
