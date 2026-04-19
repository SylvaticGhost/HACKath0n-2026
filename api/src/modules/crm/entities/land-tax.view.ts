import { ViewColumn, ViewEntity } from 'typeorm'
import { numericTransformer } from '../../../utils/numeric-transformer'

@ViewEntity({ name: 'v_land_tax', schema: 'crm', synchronize: false })
export class LandTaxView {
  @ViewColumn({ name: 'cadastral_number' })
  cadastralNumber: string

  @ViewColumn({ name: 'state_tax_id' })
  stateTaxId: string

  @ViewColumn({ name: 'taxpayer_type' })
  taxpayerType: 'individual' | 'legal_entity'

  @ViewColumn({ name: 'user' })
  user: string

  @ViewColumn({ name: 'location' })
  location: string

  @ViewColumn({ name: 'land_purpose_type' })
  landPurposeType: string

  @ViewColumn({ name: 'ownership_type' })
  ownershipType: string

  @ViewColumn({ name: 'square', transformer: numericTransformer })
  square: number

  @ViewColumn({ name: 'owner_part', transformer: numericTransformer })
  ownerPart: number

  @ViewColumn({ name: 'annual_tax_uah', transformer: numericTransformer })
  annualTaxUah: number | null

  @ViewColumn({ name: 'validation_status' })
  validationStatus: string | null
}
