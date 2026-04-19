import type { ColumnDef } from '@tanstack/react-table'
import type { LandRegistryDto } from '../../../../shared/contracts/land.registry.dto'
import { createRegistryColumn, formatDateValue, formatNumberValue } from './registry-column-helpers'
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
  }),
  createRegistryColumn<LandRegistryDto>('koatuu', 'koatuu', {
    widthClassName: 'w-[8rem] max-w-[8rem]',
  }),
  createRegistryColumn<LandRegistryDto>('ownershipType', 'ownership_type', {
    widthClassName: 'w-[11rem] max-w-[11rem]',
  }),
  createRegistryColumn<LandRegistryDto>('intendedPurpose', 'intended_purpose', {
    widthClassName: 'w-[16rem] max-w-[16rem]',
  }),
  createRegistryColumn<LandRegistryDto>('location', 'location', {
    widthClassName: 'w-[16rem] max-w-[16rem]',
  }),
  createRegistryColumn<LandRegistryDto>('landPurposeType', 'land_purpose_type', {
    widthClassName: 'w-[14rem] max-w-[14rem]',
  }),
  createRegistryColumn<LandRegistryDto>('square', 'square', {
    widthClassName: 'w-[8rem] max-w-[8rem]',
    formatValue: formatNumberValue,
  }),
  createRegistryColumn<LandRegistryDto>('estimateValue', 'estimate_value', {
    widthClassName: 'w-[10rem] max-w-[10rem]',
    formatValue: formatNumberValue,
  }),
  createRegistryColumn<LandRegistryDto>('stateTaxId', 'state_tax_id', {
    widthClassName: 'w-[10rem] max-w-[10rem]',
  }),
  createRegistryColumn<LandRegistryDto>('user', 'user', {
    widthClassName: 'w-[12rem] max-w-[12rem]',
  }),
  createRegistryColumn<LandRegistryDto>('ownerPart', 'owner_part', {
    widthClassName: 'w-[8rem] max-w-[8rem]',
    formatValue: formatNumberValue,
  }),
  createRegistryColumn<LandRegistryDto>('stateRegistrationDate', 'state_registration_date', {
    widthClassName: 'w-[12rem] max-w-[12rem]',
    formatValue: formatDateValue,
  }),
  createRegistryColumn<LandRegistryDto>('ownershipRegistrationId', 'ownership_registration_id', {
    widthClassName: 'w-[14rem] max-w-[14rem]',
  }),
  createRegistryColumn<LandRegistryDto>('registrator', 'registrator', {
    widthClassName: 'w-[14rem] max-w-[14rem]',
  }),
  createRegistryColumn<LandRegistryDto>('type', 'type', {
    widthClassName: 'w-[10rem] max-w-[10rem]',
  }),
  createRegistryColumn<LandRegistryDto>('subtype', 'subtype', {
    widthClassName: 'w-[10rem] max-w-[10rem]',
  }),
]
