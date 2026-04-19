import { useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2, RotateCcw } from 'lucide-react'

import { useAnomaliesList, useGenerateAnomalyReport } from '@/hooks/use-anomalies'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { anomaliesColumns } from './anomalies-columns'
import { AnomalyDetailsDialog } from './anomaly-details-dialog'

const DEFAULT_PAGE_SIZE = 15
const PAGE_SIZE_OPTIONS = [10, 15, 25, 50]

export function AnomaliesPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [hideResolved, setHideResolved] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<number | null>(null)

  const query = useAnomaliesList(page, pageSize, hideResolved)
  const generateMutation = useGenerateAnomalyReport()

  const totalItems = query.data?.totalItems ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const errorMessage = query.error instanceof Error ? query.error.message : 'Unable to load data.'
  const currentItemsCount = query.data?.items.length ?? 0

  const handleGenerateReport = () => {
    generateMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Anomaly report generated successfully')
        setPage(1)
      },
      onError: (error) => {
        toast.error(`Failed to generate report: ${error.message}`)
      },
    })
  }

  const fromItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const toItem = totalItems === 0 ? 0 : fromItem + currentItemsCount - 1

  return (
    <div className="flex h-full w-full flex-col">
      <header className="flex flex-col gap-4 border-b bg-background p-4 sm:flex-row sm:items-center sm:justify-between px-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Anomalies</h1>
            <p className="text-sm text-muted-foreground">Detect inconsistencies and violations between registries.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center space-x-2 mr-4">
            <Switch
              id="hide-resolved"
              checked={hideResolved}
              onCheckedChange={(checked) => {
                setHideResolved(checked)
                setPage(1)
              }}
            />
            <Label htmlFor="hide-resolved" className="text-sm cursor-pointer">
              Hide Resolved
            </Label>
          </div>

          <Button onClick={handleGenerateReport} disabled={generateMutation.isPending}>
            {generateMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 size-4" />
            )}
            Update Report
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 sm:p-6">
        {query.isError ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <section className="flex flex-col gap-4">
          <div className="overflow-x-auto">
            {query.isLoading ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-[70%]" />
              </div>
            ) : (
              <DataTable
                columns={anomaliesColumns}
                data={query.data?.items ?? []}
                showPaginationControls={false}
                onRowClick={(row) => {
                  setSelectedAnomalyId(row.id)
                  setDetailsOpen(true)
                }}
              />
            )}
          </div>
        </section>

        <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs text-muted-foreground">Rows:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value))
                setPage(1)
              }}
            >
              <SelectTrigger
                size="sm"
                className="h-7 w-auto min-w-[3.5rem] border-0 text-xs shadow-none ring-1 ring-border/20 focus:ring-border/50"
              >
                <SelectValue placeholder="15" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((sizeOption) => (
                  <SelectItem key={sizeOption} value={String(sizeOption)}>
                    {sizeOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {totalItems > 0 ? `${fromItem}-${toItem} of ${totalItems}` : '0 of 0'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || query.isLoading}
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || query.isLoading}
              >
                <ChevronRight className="size-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <AnomalyDetailsDialog
        open={detailsOpen}
        anomalyId={selectedAnomalyId}
        onOpenChange={(open) => {
          setDetailsOpen(open)
          if (!open) {
            setSelectedAnomalyId(null)
          }
        }}
      />
    </div>
  )
}
