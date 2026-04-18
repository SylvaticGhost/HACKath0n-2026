import { ViewColumn, ViewEntity } from 'typeorm'

@ViewEntity({
  name: 'v_land_diff',
  schema: 'public',
  synchronize: false,
})
export class LandDiffView {
  @ViewColumn({ name: 'cadastral_number' })
  cadastralNumber: string

  @ViewColumn({ name: 'diff_status' })
  diffStatus: string

  @ViewColumn({ name: 'registry_tax_id' })
  registryTaxId: string | null

  @ViewColumn({ name: 'registry_user' })
  registryUser: string | null

  @ViewColumn({ name: 'registry_square' })
  registrySquare: number | null

  @ViewColumn({ name: 'registry_estimate_value' })
  registryEstimateValue: number | null

  @ViewColumn({ name: 'registry_location' })
  registryLocation: string | null

  @ViewColumn({ name: 'crm_tax_id' })
  crmTaxId: string | null

  @ViewColumn({ name: 'crm_user' })
  crmUser: string | null

  @ViewColumn({ name: 'crm_square' })
  crmSquare: number | null

  @ViewColumn({ name: 'crm_estimate_value' })
  crmEstimateValue: number | null

  @ViewColumn({ name: 'crm_location' })
  crmLocation: string | null
}
