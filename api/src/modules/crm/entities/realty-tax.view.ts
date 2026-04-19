import { ViewColumn, ViewEntity } from 'typeorm'
import { numericTransformer } from '../../../utils/numeric-transformer'

@ViewEntity({ name: 'v_realty_tax', schema: 'crm', synchronize: false })
export class RealtyTaxView {
  @ViewColumn({ name: 'state_tax_id' })
  stateTaxId: string

  @ViewColumn({ name: 'ownership_registration_date' })
  ownershipRegistrationDate: Date

  @ViewColumn({ name: 'taxpayer_name' })
  taxpayerName: string

  @ViewColumn({ name: 'object_type' })
  objectType: string

  @ViewColumn({ name: 'object_address' })
  objectAddress: string

  @ViewColumn({ name: 'total_area', transformer: numericTransformer })
  totalArea: number

  @ViewColumn({ name: 'ownership_share', transformer: numericTransformer })
  ownershipShare: number

  @ViewColumn({ name: 'base_tax_uah', transformer: numericTransformer })
  baseTaxUah: number

  @ViewColumn({ name: 'luxury_tax_uah', transformer: numericTransformer })
  luxuryTaxUah: number

  @ViewColumn({ name: 'annual_tax_uah', transformer: numericTransformer })
  annualTaxUah: number

  @ViewColumn({ name: 'validation_status' })
  validationStatus: string | null
}
