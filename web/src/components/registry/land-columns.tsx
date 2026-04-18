import type { ColumnDef } from '@tanstack/react-table'
import type { LandRegistryDto } from '../../../../shared/contracts/land.registry.dto'
import { ValidationStatusIndicator, type ValidationMetadata } from './validation-status-indicator'

export const landColumns: ColumnDef<LandRegistryDto>[] = [
  {
    id: 'validation',
    header: '',
    cell: ({ row }) => <ValidationStatusIndicator value={row.original as LandRegistryDto & ValidationMetadata} />,
  },
  {
    accessorKey: 'cadastralNumber',
    header: 'Cadastral Number',
  },
  {
    accessorKey: 'koatuu',
    header: 'KOATUU',
  },
  {
    accessorKey: 'ownershipType',
    header: 'Ownership',
  },
  {
    accessorKey: 'intendedPurpose',
    header: 'Intended Purpose',
  },
  {
    accessorKey: 'landPurposeType',
    header: 'Land Purpose',
  },
  {
    accessorKey: 'square',
    header: 'Area (sq.m)',
    cell: ({ row }) => {
      const val = parseFloat(row.getValue('square'))
      return isNaN(val) ? '-' : val.toLocaleString()
    },
  },
  {
    accessorKey: 'estimateValue',
    header: 'Est. Value',
    cell: ({ row }) => {
      const val = parseFloat(row.getValue('estimateValue'))
      return isNaN(val) ? '-' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
    },
  },
  {
    accessorKey: 'stateTaxId',
    header: 'Tax ID',
  },
  {
    accessorKey: 'user',
    header: 'User',
  },
]
