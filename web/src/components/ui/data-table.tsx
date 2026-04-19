import type { ColumnDef, ColumnFiltersState, OnChangeFn, SortingState } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  showPaginationControls?: boolean
  onRowClick?: (rowData: TData) => void
  toolbar?: ReactNode
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showPaginationControls = true,
  onRowClick,
  toolbar,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    manualSorting: Boolean(onSortingChange),
    manualFiltering: Boolean(onColumnFiltersChange),
    onSortingChange,
    onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const rows = showPaginationControls ? table.getRowModel().rows : table.getCoreRowModel().rows
  const isRowClickable = typeof onRowClick === 'function'

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
        {toolbar ? <div className="border-b border-border/50 px-3 py-3">{toolbar}</div> : null}
        <Table className="min-w-full w-max [&_tr]:border-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="h-10 bg-transparent px-4 text-xs font-semibold tracking-wide uppercase text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={isRowClickable ? 'cursor-pointer' : undefined}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 text-sm text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 px-3 text-center text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPaginationControls && (
        <div className="flex items-center justify-end space-x-1 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
