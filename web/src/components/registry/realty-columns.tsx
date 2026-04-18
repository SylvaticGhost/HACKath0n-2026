import type { ColumnDef } from '@tanstack/react-table'
import type { RealtyRegistryDto } from '../../../../shared/contracts/realty.registry.dto'
import { format } from 'date-fns'
import { ValidationStatusIndicator, type ValidationMetadata } from './validation-status-indicator'

export const realtyColumns: ColumnDef<RealtyRegistryDto>[] = [
  {
    id: 'validation',
    header: '',
    cell: ({ row }) => <ValidationStatusIndicator value={row.original as RealtyRegistryDto & ValidationMetadata} />,
  },
  {
    accessorKey: 'objectType',
    header: 'Object Type',
  },
  {
    accessorKey: 'objectAddress',
    header: 'Address',
  },
  {
    accessorKey: 'taxpayerName',
    header: 'Taxpayer',
  },
  {
    accessorKey: 'stateTaxId',
    header: 'Tax ID',
  },
  {
    accessorKey: 'ownershipRegistrationDate',
    header: 'Registration Date',
    cell: ({ row }) => {
      const dateVal = row.getValue('ownershipRegistrationDate')
      if (!dateVal) return '-'
      try {
        return format(new Date(dateVal as string | number | Date), 'PP')
      } catch {
        return String(dateVal)
      }
    },
  },
  {
    accessorKey: 'totalArea',
    header: 'Total Area',
    cell: ({ row }) => {
      const val = parseFloat(row.getValue('totalArea'))
      return isNaN(val) ? '-' : val.toLocaleString()
    },
  },
  {
    accessorKey: 'jointOwnershipType',
    header: 'Joint Ownership',
  },
  {
    accessorKey: 'ownershipShare',
    header: 'Share',
    cell: ({ row }) => {
      const val = row.getValue('ownershipShare')
      return val !== null && val !== undefined ? String(val) : '-'
    },
  },
]
