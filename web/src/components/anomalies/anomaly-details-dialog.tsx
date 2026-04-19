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

function hasValue(value: unknown) {
  if (value === null || value === undefined) {
    return false
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  return true
}

function toText(value: unknown) {
  return hasValue(value) ? String(value) : null
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

    const rows: DetailRow[] = [{ label: 'ID', value: String(anomaly.id) }]

    const cadastralNumber = toText(anomaly.cadastralNumber)
    if (cadastralNumber) {
      rows.push({ label: 'Cadastral Number', value: cadastralNumber })
    }

    const landAddress = toText(anomaly.landAddress)
    if (landAddress) {
      rows.push({ label: 'Land Address', value: landAddress })
    }

    const matchedRealtyAddress = toText(anomaly.realtyAddress)
    if (matchedRealtyAddress) {
      rows.push({ label: 'Matched Realty Address', value: matchedRealtyAddress })
    }

    if (hasValue(anomaly.matchScore)) {
      rows.push({ label: 'Match Score', value: formatNumberValue(anomaly.matchScore) })
    }

    const matchReason = toText(anomaly.matchReason)
    if (matchReason) {
      rows.push({ label: 'Match Reason', value: matchReason })
    }

    return rows
  }, [detailsQuery.data])

  const landRows = useMemo<DetailRow[]>(() => {
    if (!detailsQuery.data?.land) {
      return []
    }

    const land = detailsQuery.data.land

    const rows: DetailRow[] = []

    const cadastralNumber = toText(land.cadastralNumber)
    if (cadastralNumber) rows.push({ label: 'Cadastral Number', value: cadastralNumber })

    const stateTaxId = toText(land.stateTaxId)
    if (stateTaxId) rows.push({ label: 'State Tax ID', value: stateTaxId })

    const user = toText(land.user)
    if (user) rows.push({ label: 'User', value: user })

    const location = toText(land.location)
    if (location) rows.push({ label: 'Location', value: location })

    if (hasValue(land.square)) rows.push({ label: 'Square (ha)', value: formatNumberValue(land.square) })
    if (hasValue(land.estimateValue)) {
      rows.push({ label: 'Estimate Value', value: formatNumberValue(land.estimateValue) })
    }

    const ownershipType = toText(land.ownershipType)
    if (ownershipType) rows.push({ label: 'Ownership Type', value: ownershipType })

    const intendedPurpose = toText(land.intendedPurpose)
    if (intendedPurpose) rows.push({ label: 'Intended Purpose', value: intendedPurpose })

    const landPurposeType = toText(land.landPurposeType)
    if (landPurposeType) rows.push({ label: 'Land Purpose Type', value: landPurposeType })

    if (hasValue(land.ownerPart)) rows.push({ label: 'Owner Part', value: formatNumberValue(land.ownerPart) })

    if (hasValue(land.stateRegistrationDate)) {
      rows.push({ label: 'State Registration Date', value: formatDateValue(land.stateRegistrationDate) })
    }

    const ownershipRegistrationId = toText(land.ownershipRegistrationId)
    if (ownershipRegistrationId) rows.push({ label: 'Ownership Registration ID', value: ownershipRegistrationId })

    const registrator = toText(land.registrator)
    if (registrator) rows.push({ label: 'Registrator', value: registrator })

    const type = toText(land.type)
    if (type) rows.push({ label: 'Type', value: type })

    const subtype = toText(land.subtype)
    if (subtype) rows.push({ label: 'Subtype', value: subtype })

    const contactEmail = toText(land.propertyInfo?.email)
    if (contactEmail) rows.push({ label: 'Contact Email', value: contactEmail })

    const contactPhone = toText(land.propertyInfo?.phone)
    if (contactPhone) rows.push({ label: 'Contact Phone', value: contactPhone })

    return rows
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

                {landRows.length > 0 ? (
                  <>
                    <Separator />
                    <section className="space-y-3">
                      <h3 className="text-base font-semibold">Land Plot</h3>
                      <DetailsGrid rows={landRows} />
                    </section>
                  </>
                ) : null}

                {hasMatchedRealtyAddress && detailsQuery.data.realty.length ? (
                  <>
                    <Separator />
                    <section className="space-y-3">
                      <h3 className="text-base font-semibold">Related Realty By Matched Address</h3>
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
                            const contact = [toText(item.propertyInfo?.email), toText(item.propertyInfo?.phone)]
                              .filter((value): value is string => Boolean(value))
                              .join(' / ')

                            return (
                              <TableRow key={rowKey}>
                                <TableCell className="font-mono text-xs">{toText(item.stateTaxId) ?? ''}</TableCell>
                                <TableCell>{toText(item.taxpayerName) ?? ''}</TableCell>
                                <TableCell>{toText(item.objectType) ?? ''}</TableCell>
                                <TableCell className="max-w-[18rem] whitespace-normal">
                                  {toText(item.objectAddress) ?? ''}
                                </TableCell>
                                <TableCell>
                                  {hasValue(item.ownershipRegistrationDate)
                                    ? formatDateValue(item.ownershipRegistrationDate)
                                    : ''}
                                </TableCell>
                                <TableCell>
                                  {hasValue(item.ownershipTerminationDate)
                                    ? formatDateValue(item.ownershipTerminationDate)
                                    : ''}
                                </TableCell>
                                <TableCell>
                                  {hasValue(item.totalArea) ? formatNumberValue(item.totalArea) : ''}
                                </TableCell>
                                <TableCell>
                                  {hasValue(item.ownershipShare) ? formatNumberValue(item.ownershipShare) : ''}
                                </TableCell>
                                <TableCell>{contact}</TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </section>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
