import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  CONFLICT: { label: 'Conflict', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
  NEW_IN_REGISTRY: {
    label: 'New in Registry',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  MISSING_IN_REGISTRY: {
    label: 'Missing',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  },
  MATCH: { label: 'Match', className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
}

interface DiffStatusBadgeProps {
  status: string
}

export function DiffStatusBadge({ status }: DiffStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-muted text-muted-foreground' }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', config.className)}>
      {config.label}
    </span>
  )
}
