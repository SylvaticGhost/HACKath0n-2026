import { ViewColumn, ViewEntity } from 'typeorm'

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

  @ViewColumn({ name: 'square' })
  square: number

  @ViewColumn({ name: 'ngo_uah' })
  ngoUah: number

  @ViewColumn({ name: 'indexation_coefficient' })
  indexationCoefficient: number

  @ViewColumn({ name: 'tax_rate' })
  taxRate: number

  @ViewColumn({ name: 'owner_part' })
  ownerPart: number

  @ViewColumn({ name: 'annual_tax_uah' })
  annualTaxUah: number | null

  @ViewColumn({ name: 'validation_status' })
  validationStatus: string | null
}
