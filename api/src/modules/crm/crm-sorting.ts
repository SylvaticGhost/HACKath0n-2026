import type { LandSearchDto, RealtySearchDto } from 'shared'

export const LAND_CRM_SORT_COLUMNS: Record<NonNullable<LandSearchDto['sortBy']>, string> = {
  cadastralNumber: 'land.cadastralNumber',
  location: 'land.location',
  square: 'land.square',
  estimateValue: 'land.estimateValue',
  stateTaxId: 'land.stateTaxId',
  user: 'land.user',
  stateRegistrationDate: 'land.stateRegistrationDate',
}

export const REALTY_CRM_SORT_COLUMNS: Record<NonNullable<RealtySearchDto['sortBy']>, string> = {
  stateTaxId: 'realty.stateTaxId',
  ownershipRegistrationDate: 'realty.ownershipRegistrationDate',
  taxpayerName: 'realty.taxpayerName',
  objectAddress: 'realty.objectAddress',
  totalArea: 'realty.totalArea',
  ownershipShare: 'realty.ownershipShare',
}
