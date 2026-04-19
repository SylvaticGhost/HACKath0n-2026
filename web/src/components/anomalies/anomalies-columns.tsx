import type { ColumnDef } from '@tanstack/react-table'
import type { AnomalyDto } from 'shared'

import { Badge } from '@/components/ui/badge'
import { AnomaliesRowActions } from './anomalies-row-actions'
import { cn } from '@/lib/utils'

function renderTruncatedValue(value: string, widthClassName: string) {
  return (
    <div className={cn('min-w-0 truncate', widthClassName)} title={value}>
      {value}
    </div>
  )
}

export const anomaliesColumns: ColumnDef<AnomalyDto>[] = [
  {
    accessorKey: 'id',
    header: () => renderTruncatedValue('id', 'w-[4rem] max-w-[4rem]'),
    cell: ({ row }) => <div className="w-16 max-w-16 font-mono text-xs">{row.original.id}</div>,
  },
  {
    accessorKey: 'cadastralNumber',
    header: () => renderTruncatedValue('cadastral_number', 'w-[12rem] max-w-[12rem]'),
    cell: ({ row }) => (
      <div
        className="w-48 max-w-48 truncate font-mono text-xs text-muted-foreground"
        title={row.original.cadastralNumber || ''}
      >
        {row.original.cadastralNumber || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'landAddress',
    header: () => renderTruncatedValue('land_address', 'w-[12rem] max-w-[12rem]'),
    cell: ({ row }) => renderTruncatedValue(row.original.landAddress || '-', 'w-[12rem] max-w-[12rem]'),
  },
  {
    accessorKey: 'realtyAddress',
    header: () => renderTruncatedValue('realty_address', 'w-[12rem] max-w-[12rem]'),
    cell: ({ row }) => renderTruncatedValue(row.original.realtyAddress || '-', 'w-[12rem] max-w-[12rem]'),
  },
  {
    accessorKey: 'matchReason',
    header: () => renderTruncatedValue('match_reason', 'w-[15rem] max-w-[15rem]'),
    cell: ({ row }) => (
      <div className="truncate font-medium" title={row.original.matchReason || ''}>
        {row.original.matchReason || '-'}
      </div>
    ),
  },
  {
    id: 'actions',
    header: () => renderTruncatedValue('actions', 'w-[6rem] max-w-[6rem] text-right'),
    cell: ({ row }) => (
      <div className="w-24 max-w-24 text-right">
        <AnomaliesRowActions anomaly={row.original} />
      </div>
    ),
  },
]
