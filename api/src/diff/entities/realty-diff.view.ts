import { ViewColumn, ViewEntity } from 'typeorm'

@ViewEntity({
  name: 'v_realty_diff',
  schema: 'public',
  synchronize: false,
})
export class RealtyDiffView {
  @ViewColumn({ name: 'state_tax_id' })
  stateTaxId: string

  @ViewColumn({ name: 'ownership_registration_date' })
  ownershipRegistrationDate: Date

  @ViewColumn({ name: 'diff_status' })
  diffStatus: string

  @ViewColumn({ name: 'registry_taxpayer_name' })
  registryTaxpayerName: string | null

  @ViewColumn({ name: 'registry_address' })
  registryAddress: string | null

  @ViewColumn({ name: 'registry_total_area' })
  registryTotalArea: number | null

  @ViewColumn({ name: 'registry_ownership_share' })
  registryOwnershipShare: number | null

  @ViewColumn({ name: 'crm_taxpayer_name' })
  crmTaxpayerName: string | null

  @ViewColumn({ name: 'crm_address' })
  crmAddress: string | null

  @ViewColumn({ name: 'crm_total_area' })
  crmTotalArea: number | null

  @ViewColumn({ name: 'crm_ownership_share' })
  crmOwnershipShare: number | null

  @ViewColumn({ name: 'similarity_score' })
  similarityScore: number | null
}
