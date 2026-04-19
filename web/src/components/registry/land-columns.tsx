import type { ColumnDef } from '@tanstack/react-table'
import type { LandRegistryDto } from '../../../../shared/contracts/land.registry.dto'

import { createRegistryColumn, formatDateValue, formatNumberValue } from './registry-column-helpers'
import { RegistryColumnHeader } from './registry-column-header'
import { ValidationStatusIndicator } from './validation-status-indicator'

export const landColumns: ColumnDef<LandRegistryDto>[] = [
  {
    id: 'validation-status',
    header: () => <div className="w-5" aria-hidden="true" />,
    cell: ({ row }) => <ValidationStatusIndicator value={row.original} />,
    enableSorting: false,
    size: 28,
  },
  createRegistryColumn<LandRegistryDto>('cadastralNumber', 'cadastral_number', {
    widthClassName: 'w-[12rem] max-w-[12rem]',
    header: ({ column }) => (
      <RegistryColumnHeader column={column} title="cadastral_number" sortable filterVariant="text" />
    ),
  }),
  createRegistryColumn<LandRegistryDto>('koatuu', 'koatuu', {
    widthClassName: 'w-[8rem] max-w-[8rem]',
    header: () => <RegistryColumnHeader title="koatuu" />,
  }),
  createRegistryColumn<LandRegistryDto>('ownershipType', 'ownership_type', {
    widthClassName: 'w-[11rem] max-w-[11rem]',
    header: () => <RegistryColumnHeader title="ownership_type" />,
  }),
  createRegistryColumn<LandRegistryDto>('intendedPurpose', 'intended_purpose', {
    widthClassName: 'w-[16rem] max-w-[16rem]',
    header: () => <RegistryColumnHeader title="intended_purpose" />,
  }),
  createRegistryColumn<LandRegistryDto>('location', 'location', {
    widthClassName: 'w-[16rem] max-w-[16rem]',
    header: ({ column }) => <RegistryColumnHeader column={column} title="location" sortable />,
  }),
  createRegistryColumn<LandRegistryDto>('landPurposeType', 'land_purpose_type', {
    widthClassName: 'w-[14rem] max-w-[14rem]',
    header: () => <RegistryColumnHeader title="land_purpose_type" />,
  }),
  createRegistryColumn<LandRegistryDto>('square', 'square', {
    widthClassName: 'w-[8rem] max-w-[8rem]',
    formatValue: formatNumberValue,
    header: ({ column }) => <RegistryColumnHeader column={column} title="square" sortable filterVariant="range" />,
  }),
  createRegistryColumn<LandRegistryDto>('estimateValue', 'estimate_value', {
    widthClassName: 'w-[10rem] max-w-[10rem]',
    formatValue: formatNumberValue,
    header: ({ column }) => (
      <RegistryColumnHeader column={column} title="estimate_value" sortable filterVariant="range" />
    ),
  }),
  createRegistryColumn<LandRegistryDto>('stateTaxId', 'state_tax_id', {
    widthClassName: 'w-[10rem] max-w-[10rem]',
    header: ({ column }) => <RegistryColumnHeader column={column} title="state_tax_id" sortable filterVariant="text" />,
  }),
  createRegistryColumn<LandRegistryDto>('user', 'user', {
    widthClassName: 'w-[12rem] max-w-[12rem]',
    header: ({ column }) => <RegistryColumnHeader column={column} title="user" sortable filterVariant="text" />,
  }),
  createRegistryColumn<LandRegistryDto>('ownerPart', 'owner_part', {
    widthClassName: 'w-[8rem] max-w-[8rem]',
    formatValue: formatNumberValue,
    header: () => <RegistryColumnHeader title="owner_part" />,
  }),
  createRegistryColumn<LandRegistryDto>('stateRegistrationDate', 'state_registration_date', {
    widthClassName: 'w-[12rem] max-w-[12rem]',
    formatValue: formatDateValue,
    header: ({ column }) => <RegistryColumnHeader column={column} title="state_registration_date" sortable />,
  }),
  createRegistryColumn<LandRegistryDto>('ownershipRegistrationId', 'ownership_registration_id', {
    widthClassName: 'w-[14rem] max-w-[14rem]',
    header: () => <RegistryColumnHeader title="ownership_registration_id" />,
  }),
  createRegistryColumn<LandRegistryDto>('registrator', 'registrator', {
    widthClassName: 'w-[14rem] max-w-[14rem]',
    header: () => <RegistryColumnHeader title="registrator" />,
  }),
  createRegistryColumn<LandRegistryDto>('type', 'type', {
    widthClassName: 'w-[10rem] max-w-[10rem]',
    header: () => <RegistryColumnHeader title="type" />,
  }),
  createRegistryColumn<LandRegistryDto>('subtype', 'subtype', {
    widthClassName: 'w-[10rem] max-w-[10rem]',
    header: () => <RegistryColumnHeader title="subtype" />,
  }),
]
