import { ViewColumn, ViewEntity } from 'typeorm'

@ViewEntity({ name: 'v_realty_tax', schema: 'crm', synchronize: false })
export class RealtyTaxView {
  @ViewColumn({ name: 'state_tax_id' })
  stateTaxId: string

  @ViewColumn({ name: 'ownership_registration_date' })
  ownershipRegistrationDate: Date

  @ViewColumn({ name: 'ownership_termination_date' })
  ownershipTerminationDate: Date | null

  @ViewColumn({ name: 'taxpayer_name' })
  taxpayerName: string

  @ViewColumn({ name: 'object_type' })
  objectType: string

  @ViewColumn({ name: 'object_address' })
  objectAddress: string

  @ViewColumn({ name: 'total_area' })
  totalArea: number

  @ViewColumn({ name: 'exempt_area_m2' })
  exemptAreaM2: number

  @ViewColumn({ name: 'taxable_area_m2' })
  taxableAreaM2: number

  @ViewColumn({ name: 'min_wage_uah' })
  minWageUah: number

  @ViewColumn({ name: 'tax_rate' })
  taxRate: number

  @ViewColumn({ name: 'ownership_share' })
  ownershipShare: number

  @ViewColumn({ name: 'base_tax_uah' })
  baseTaxUah: number

  @ViewColumn({ name: 'luxury_tax_uah' })
  luxuryTaxUah: number

  @ViewColumn({ name: 'annual_tax_uah' })
  annualTaxUah: number

  @ViewColumn({ name: 'validation_status' })
  validationStatus: string | null
}
