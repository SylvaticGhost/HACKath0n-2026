import type { ColumnDef } from '@tanstack/react-table'
import { format, isValid, parseISO } from 'date-fns'

import { cn } from '@/lib/utils'

const DEFAULT_WIDTH_CLASS = 'w-[11rem] max-w-[11rem]'

interface RegistryColumnOptions<TData> {
  widthClassName?: string
  formatValue?: (value: unknown, row: TData) => string
  header?: ColumnDef<TData, any>['header']
}

function renderTruncatedValue(value: string, widthClassName: string) {
  return (
    <div className={cn('min-w-0 truncate', widthClassName)} title={value}>
      {value}
    </div>
  )
}

function isEmptyValue(value: unknown) {
  return value === null || value === undefined || value === ''
}

export function formatNumberValue(value: unknown) {
  if (isEmptyValue(value)) {
    return '-'
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '-'
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim()
    if (!trimmedValue) {
      return '-'
    }

    const parsedValue = Number(trimmedValue)
    return Number.isFinite(parsedValue) ? trimmedValue : value
  }

  return String(value)
}

export function formatDateValue(value: unknown) {
  if (isEmptyValue(value)) {
    return '-'
  }

  if (value instanceof Date) {
    return isValid(value) ? format(value, 'yyyy-MM-dd') : String(value)
  }

  if (typeof value === 'string') {
    const parsedValue = parseISO(value)
    if (isValid(parsedValue)) {
      return format(parsedValue, 'yyyy-MM-dd')
    }

    return value
  }

  const parsedValue = new Date(String(value))
  return isValid(parsedValue) ? format(parsedValue, 'yyyy-MM-dd') : String(value)
}

export function formatDefaultValue(value: unknown) {
  if (isEmptyValue(value)) {
    return '-'
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : '-'
  }

  if (value instanceof Date) {
    return formatDateValue(value)
  }

  return String(value)
}

export function createRegistryColumn<TData extends object>(
  accessorKey: keyof TData & string,
  header: string,
  options: RegistryColumnOptions<TData> = {},
): ColumnDef<TData> {
  const widthClassName = options.widthClassName ?? DEFAULT_WIDTH_CLASS

  return {
    accessorKey,
    header: options.header ?? (() => renderTruncatedValue(header, widthClassName)),
    cell: ({ row }) => {
      const rawValue = row.getValue(accessorKey)
      const displayValue = options.formatValue?.(rawValue, row.original) ?? formatDefaultValue(rawValue)
      return renderTruncatedValue(displayValue, widthClassName)
    },
  }
}
