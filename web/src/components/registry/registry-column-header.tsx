import type { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type FilterVariant = 'text' | 'range'

interface RangeFilterValue {
  min?: string
  max?: string
}

interface RegistryColumnHeaderProps<TData> {
  column?: Column<TData, unknown>
  title: string
  sortable?: boolean
  filterVariant?: FilterVariant
  className?: string
}

function normalizeRangeFilterValue(value: RangeFilterValue) {
  const min = value.min?.trim() ?? ''
  const max = value.max?.trim() ?? ''

  if (!min && !max) {
    return undefined
  }

  return { min, max }
}

function toRangeFilterValue(value: unknown): RangeFilterValue {
  if (!value || typeof value !== 'object') {
    return {}
  }

  const candidate = value as RangeFilterValue

  return {
    min: typeof candidate.min === 'string' ? candidate.min : '',
    max: typeof candidate.max === 'string' ? candidate.max : '',
  }
}

function hasActiveFilter(value: unknown) {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as RangeFilterValue
  return Boolean(candidate.min?.trim() || candidate.max?.trim())
}

function SortIcon<TData>({ column }: { column: Column<TData, unknown> }) {
  if (column.getIsSorted() === 'desc') {
    return <ArrowDown className="size-3.5 text-foreground" />
  }

  if (column.getIsSorted() === 'asc') {
    return <ArrowUp className="size-3.5 text-foreground" />
  }

  return <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
}

export function RegistryColumnHeader<TData>({
  column,
  title,
  sortable = false,
  filterVariant,
  className,
}: RegistryColumnHeaderProps<TData>) {
  const label = (
    <span className="truncate text-xs font-semibold tracking-wide uppercase text-muted-foreground">{title}</span>
  )

  const filterValue = column?.getFilterValue()

  return (
    <div className={cn('flex min-w-0 items-center gap-1', className)}>
      {sortable && column ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 min-w-0 gap-1.5 px-3 shadow-none hover:bg-muted/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {label}
          <SortIcon column={column} />
        </Button>
      ) : (
        <div className="min-w-0 px-0.5">{label}</div>
      )}

      {filterVariant && column ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'size-7 shrink-0 shadow-none',
                hasActiveFilter(filterValue)
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground/50 hover:text-foreground',
              )}
            >
              <Filter className="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-2" align="start">
            {filterVariant === 'text' ? (
              <Input
                value={typeof filterValue === 'string' ? filterValue : ''}
                onChange={(event) => column.setFilterValue(event.target.value.trim() || undefined)}
                placeholder="Filter value"
                className="h-8 text-xs shadow-none"
              />
            ) : (
              <div className="space-y-2">
                <Input
                  value={toRangeFilterValue(filterValue).min ?? ''}
                  onChange={(event) => {
                    const currentValue = toRangeFilterValue(column.getFilterValue())
                    column.setFilterValue(
                      normalizeRangeFilterValue({
                        ...currentValue,
                        min: event.target.value,
                      }),
                    )
                  }}
                  placeholder="Min"
                  inputMode="decimal"
                  className="h-8 text-xs shadow-none"
                />
                <Input
                  value={toRangeFilterValue(filterValue).max ?? ''}
                  onChange={(event) => {
                    const currentValue = toRangeFilterValue(column.getFilterValue())
                    column.setFilterValue(
                      normalizeRangeFilterValue({
                        ...currentValue,
                        max: event.target.value,
                      }),
                    )
                  }}
                  placeholder="Max"
                  inputMode="decimal"
                  className="h-8 text-xs shadow-none"
                />
              </div>
            )}
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  )
}
