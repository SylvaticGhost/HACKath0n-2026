import type { ColumnDef } from '@tanstack/react-table'
import type { RealtyRegistryDto } from '../../../../shared/contracts/realty.registry.dto'

import { createRegistryColumn, formatDateValue, formatNumberValue } from './registry-column-helpers'
import { RegistryColumnHeader } from './registry-column-header'
import { ValidationStatusIndicator } from './validation-status-indicator'

export const realtyColumns: ColumnDef<RealtyRegistryDto>[] = [
  {
    id: 'validation-status',
    header: () => <div className="w-5" aria-hidden="true" />,
    cell: ({ row }) => <ValidationStatusIndicator value={row.original} />,
    enableSorting: false,
    size: 28,
  },
  createRegistryColumn<RealtyRegistryDto>('stateTaxId', 'state_tax_id', {
    widthClassName: 'w-[10rem] max-w-[10rem]',
    header: ({ column }) => <RegistryColumnHeader column={column} title="state_tax_id" sortable filterVariant="text" />,
  }),
  createRegistryColumn<RealtyRegistryDto>('ownershipRegistrationDate', 'ownership_registration_date', {
    widthClassName: 'w-[12rem] max-w-[12rem]',
    formatValue: formatDateValue,
    header: ({ column }) => <RegistryColumnHeader column={column} title="ownership_registration_date" sortable />,
  }),
  createRegistryColumn<RealtyRegistryDto>('taxpayerName', 'taxpayer_name', {
    widthClassName: 'w-[14rem] max-w-[14rem]',
    header: ({ column }) => (
      <RegistryColumnHeader column={column} title="taxpayer_name" sortable filterVariant="text" />
    ),
  }),
  createRegistryColumn<RealtyRegistryDto>('objectType', 'object_type', {
    widthClassName: 'w-[11rem] max-w-[11rem]',
    header: () => <RegistryColumnHeader title="object_type" />,
  }),
  createRegistryColumn<RealtyRegistryDto>('objectAddress', 'object_address', {
    widthClassName: 'w-[18rem] max-w-[18rem]',
    header: ({ column }) => <RegistryColumnHeader column={column} title="object_address" sortable />,
  }),
  createRegistryColumn<RealtyRegistryDto>('ownershipTerminationDate', 'ownership_termination_date', {
    widthClassName: 'w-[12rem] max-w-[12rem]',
    formatValue: formatDateValue,
    header: () => <RegistryColumnHeader title="ownership_termination_date" />,
  }),
  createRegistryColumn<RealtyRegistryDto>('totalArea', 'total_area', {
    widthClassName: 'w-[8rem] max-w-[8rem]',
    formatValue: formatNumberValue,
    header: ({ column }) => <RegistryColumnHeader column={column} title="total_area" sortable filterVariant="range" />,
  }),
  createRegistryColumn<RealtyRegistryDto>('jointOwnershipType', 'joint_ownership_type', {
    widthClassName: 'w-[13rem] max-w-[13rem]',
    header: () => <RegistryColumnHeader title="joint_ownership_type" />,
  }),
  createRegistryColumn<RealtyRegistryDto>('ownershipShare', 'ownership_share', {
    widthClassName: 'w-[9rem] max-w-[9rem]',
    formatValue: formatNumberValue,
    header: ({ column }) => (
      <RegistryColumnHeader column={column} title="ownership_share" sortable filterVariant="range" />
    ),
  }),
]
