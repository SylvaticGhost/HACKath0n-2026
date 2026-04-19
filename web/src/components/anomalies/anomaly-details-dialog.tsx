import { useMemo } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { useAnomalyDetails } from '@/hooks/use-anomalies'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateValue, formatNumberValue } from '@/components/registry/registry-column-helpers'
import { cn } from '@/lib/utils'

interface AnomalyDetailsDialogProps {
  open: boolean
  anomalyId: number | null
  onOpenChange: (open: boolean) => void
}

interface DetailRow {
  label: string
  value: string
}

function normalizeValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return String(value)
}

function resolveStatusClass(status: string) {
  return status.toUpperCase() === 'RESOLVED' ? 'bg-green-500/15 text-green-700' : 'bg-amber-500/15 text-amber-700'
}

function DetailsGrid({ rows }: { rows: DetailRow[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="rounded-md border bg-muted/20 p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{row.label}</dt>
          <dd className="mt-1 wrap-break-word text-sm text-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function AnomalyDetailsDialog({ open, anomalyId, onOpenChange }: AnomalyDetailsDialogProps) {
  const detailsQuery = useAnomalyDetails(anomalyId, { enabled: open })
  const hasMatchedRealtyAddress = Boolean(detailsQuery.data?.anomaly.realtyAddress?.trim())

  const anomalyRows = useMemo<DetailRow[]>(() => {
    if (!detailsQuery.data) {
      return []
    }

    const anomaly = detailsQuery.data.anomaly

    return [
      { label: 'ID', value: normalizeValue(anomaly.id) },
      { label: 'Cadastral Number', value: normalizeValue(anomaly.cadastralNumber) },
      { label: 'Land Address', value: normalizeValue(anomaly.landAddress) },
      { label: 'Matched Realty Address', value: normalizeValue(anomaly.realtyAddress) },
      { label: 'Match Score', value: formatNumberValue(anomaly.matchScore) },
      { label: 'Match Reason', value: normalizeValue(anomaly.matchReason) },
    ]
  }, [detailsQuery.data])

  const landRows = useMemo<DetailRow[]>(() => {
    if (!detailsQuery.data?.land) {
      return []
    }

    const land = detailsQuery.data.land

    return [
      { label: 'Cadastral Number', value: normalizeValue(land.cadastralNumber) },
      { label: 'State Tax ID', value: normalizeValue(land.stateTaxId) },
      { label: 'User', value: normalizeValue(land.user) },
      { label: 'Location', value: normalizeValue(land.location) },
      { label: 'Square (ha)', value: formatNumberValue(land.square) },
      { label: 'Estimate Value', value: formatNumberValue(land.estimateValue) },
      { label: 'Ownership Type', value: normalizeValue(land.ownershipType) },
      { label: 'Intended Purpose', value: normalizeValue(land.intendedPurpose) },
      { label: 'Land Purpose Type', value: normalizeValue(land.landPurposeType) },
      { label: 'Owner Part', value: formatNumberValue(land.ownerPart) },
      { label: 'State Registration Date', value: formatDateValue(land.stateRegistrationDate) },
      { label: 'Ownership Registration ID', value: normalizeValue(land.ownershipRegistrationId) },
      { label: 'Registrator', value: normalizeValue(land.registrator) },
      { label: 'Type', value: normalizeValue(land.type) },
      { label: 'Subtype', value: normalizeValue(land.subtype) },
      { label: 'Contact Email', value: normalizeValue(land.propertyInfo?.email) },
      { label: 'Contact Phone', value: normalizeValue(land.propertyInfo?.phone) },
    ]
  }, [detailsQuery.data])

  const errorMessage = detailsQuery.error instanceof Error ? detailsQuery.error.message : 'Unable to load details.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-6xl" showCloseButton>
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Anomaly Details</DialogTitle>
          <DialogDescription>
            Full anomaly context with linked land record and all related real estate entries.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[75vh] px-6 pb-6">
          <div className="flex flex-col gap-6 pt-6">
            {detailsQuery.isLoading ? (
              <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading anomaly details...
              </div>
            ) : null}

            {detailsQuery.isError ? (
              <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 size-4" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            {detailsQuery.data ? (
              <>
                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-base font-semibold">Anomaly</h3>
                    <Badge className={cn(resolveStatusClass(detailsQuery.data.anomaly.status))}>
                      {detailsQuery.data.anomaly.status}
                    </Badge>
                  </div>
                  <DetailsGrid rows={anomalyRows} />
                </section>

                <Separator />

                <section className="space-y-3">
                  <h3 className="text-base font-semibold">Land Plot</h3>
                  {detailsQuery.data.land ? (
                    <DetailsGrid rows={landRows} />
                  ) : (
                    <p className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                      No linked land record found for this anomaly.
                    </p>
                  )}
                </section>

                <Separator />

                <section className="space-y-3">
                  <h3 className="text-base font-semibold">Related Realty By Matched Address</h3>
                  {hasMatchedRealtyAddress && detailsQuery.data.realty.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>State Tax ID</TableHead>
                          <TableHead>Taxpayer</TableHead>
                          <TableHead>Object Type</TableHead>
                          <TableHead>Object Address</TableHead>
                          <TableHead>Registration Date</TableHead>
                          <TableHead>Termination Date</TableHead>
                          <TableHead>Total Area</TableHead>
                          <TableHead>Ownership Share</TableHead>
                          <TableHead>Contact</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailsQuery.data.realty.map((item) => {
                          const rowKey = `${item.stateTaxId}-${formatDateValue(item.ownershipRegistrationDate)}`

                          return (
                            <TableRow key={rowKey}>
                              <TableCell className="font-mono text-xs">{item.stateTaxId}</TableCell>
                              <TableCell>{normalizeValue(item.taxpayerName)}</TableCell>
                              <TableCell>{normalizeValue(item.objectType)}</TableCell>
                              <TableCell className="max-w-[18rem] whitespace-normal">
                                {normalizeValue(item.objectAddress)}
                              </TableCell>
                              <TableCell>{formatDateValue(item.ownershipRegistrationDate)}</TableCell>
                              <TableCell>{formatDateValue(item.ownershipTerminationDate)}</TableCell>
                              <TableCell>{formatNumberValue(item.totalArea)}</TableCell>
                              <TableCell>{formatNumberValue(item.ownershipShare)}</TableCell>
                              <TableCell>
                                {normalizeValue(item.propertyInfo?.email)} / {normalizeValue(item.propertyInfo?.phone)}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  ) : hasMatchedRealtyAddress ? (
                    <p className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                      No realty records found by matched realty address.
                    </p>
                  ) : (
                    <p className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                      Matched Realty Address is missing, so related realty lookup is not performed.
                    </p>
                  )}
                </section>
              </>
            ) : null}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
