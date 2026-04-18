import type { ColumnDef } from '@tanstack/react-table'
import type { RealtyRegistryDto } from '../../../../shared/contracts/realty.registry.dto'
import { createRegistryColumn, formatDateValue, formatNumberValue } from './registry-column-helpers'

export const realtyColumns: ColumnDef<RealtyRegistryDto>[] = [
  createRegistryColumn<RealtyRegistryDto>('stateTaxId', 'state_tax_id', {
    widthClassName: 'w-[10rem] max-w-[10rem]',
  }),
  createRegistryColumn<RealtyRegistryDto>('ownershipRegistrationDate', 'ownership_registration_date', {
    widthClassName: 'w-[12rem] max-w-[12rem]',
    formatValue: formatDateValue,
  }),
  createRegistryColumn<RealtyRegistryDto>('taxpayerName', 'taxpayer_name', {
    widthClassName: 'w-[14rem] max-w-[14rem]',
  }),
  createRegistryColumn<RealtyRegistryDto>('objectType', 'object_type', {
    widthClassName: 'w-[11rem] max-w-[11rem]',
  }),
  createRegistryColumn<RealtyRegistryDto>('objectAddress', 'object_address', {
    widthClassName: 'w-[18rem] max-w-[18rem]',
  }),
  createRegistryColumn<RealtyRegistryDto>('ownershipTerminationDate', 'ownership_termination_date', {
    widthClassName: 'w-[12rem] max-w-[12rem]',
    formatValue: formatDateValue,
  }),
  createRegistryColumn<RealtyRegistryDto>('totalArea', 'total_area', {
    widthClassName: 'w-[8rem] max-w-[8rem]',
    formatValue: formatNumberValue,
  }),
  createRegistryColumn<RealtyRegistryDto>('jointOwnershipType', 'joint_ownership_type', {
    widthClassName: 'w-[13rem] max-w-[13rem]',
  }),
  createRegistryColumn<RealtyRegistryDto>('ownershipShare', 'ownership_share', {
    widthClassName: 'w-[9rem] max-w-[9rem]',
    formatValue: formatNumberValue,
  }),
]
