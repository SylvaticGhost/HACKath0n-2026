import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { Building2, ChevronLeft, ChevronRight, Loader2, MapPinned, Minus, Plus } from 'lucide-react'

import { useLandDiffList, useRealtyDiffList } from '@/hooks/use-diff'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { DiffStatusBadge } from './diff-status-badge'
import type { LandDiffViewDto, RealtyDiffViewDto } from 'shared'
import { format, isValid } from 'date-fns'

export type DiffEntity = 'Land' | 'Realty'

interface DiffPageProps {
  entity: DiffEntity
}

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50]

function fmt(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

function fmtDate(value: Date | string | null | undefined): string {
  if (value === null || value === undefined) return ''
  const d = value instanceof Date ? value : new Date(value)
  return isValid(d) ? format(d, 'yyyy-MM-dd') : String(value)
}

interface DiffRowProps {
  label: string
  registryVal: string | number | null | undefined
  crmVal: string | number | null | undefined
  fmtFn?: (v: string | number | null | undefined) => string
  onlyRegistry?: boolean
  onlyCrm?: boolean
}

function DiffRow({ label, registryVal, crmVal, fmtFn = fmt, onlyRegistry, onlyCrm }: DiffRowProps) {
  const regStr = fmtFn(registryVal)
  const crmStr = fmtFn(crmVal)
  const differs = regStr !== crmStr

  if (onlyRegistry) {
    return (
      <div className="flex text-xs font-mono">
        <div className="flex w-1/2 items-start gap-1.5 bg-red-500/10 px-3 py-1 border-r border-red-500/20">
          <Minus className="mt-0.5 size-3 shrink-0 text-red-500" />
          <span className="text-muted-foreground/60 shrink-0 w-24">{label}</span>
          <span className="text-red-400 break-all">
            {regStr || <span className="italic text-muted-foreground/40">empty</span>}
          </span>
        </div>
        <div className="flex w-1/2 items-start gap-1.5 bg-muted/10 px-3 py-1 opacity-30">
          <span className="size-3 shrink-0" />
          <span className="text-muted-foreground/60 shrink-0 w-24">{label}</span>
          <span className="italic text-muted-foreground/40">—</span>
        </div>
      </div>
    )
  }

  if (onlyCrm) {
    return (
      <div className="flex text-xs font-mono">
        <div className="flex w-1/2 items-start gap-1.5 bg-muted/10 px-3 py-1 border-r border-muted/20 opacity-30">
          <span className="size-3 shrink-0" />
          <span className="text-muted-foreground/60 shrink-0 w-24">{label}</span>
          <span className="italic text-muted-foreground/40">—</span>
        </div>
        <div className="flex w-1/2 items-start gap-1.5 bg-green-500/10 px-3 py-1">
          <Plus className="mt-0.5 size-3 shrink-0 text-green-500" />
          <span className="text-muted-foreground/60 shrink-0 w-24">{label}</span>
          <span className="text-green-400 break-all">
            {crmStr || <span className="italic text-muted-foreground/40">empty</span>}
          </span>
        </div>
      </div>
    )
  }

  if (!differs) {
    return (
      <div className="flex text-xs font-mono">
        <div className="flex w-1/2 items-start gap-1.5 px-3 py-1 border-r border-border/30">
          <span className="size-3 shrink-0" />
          <span className="text-muted-foreground/50 shrink-0 w-24">{label}</span>
          <span className="text-foreground/60 break-all">
            {regStr || <span className="italic text-muted-foreground/30">empty</span>}
          </span>
        </div>
        <div className="flex w-1/2 items-start gap-1.5 px-3 py-1">
          <span className="size-3 shrink-0" />
          <span className="text-muted-foreground/50 shrink-0 w-24">{label}</span>
          <span className="text-foreground/60 break-all">
            {crmStr || <span className="italic text-muted-foreground/30">empty</span>}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex text-xs font-mono">
      <div className="flex w-1/2 items-start gap-1.5 bg-red-500/10 px-3 py-1 border-r border-red-500/20">
        <Minus className="mt-0.5 size-3 shrink-0 text-red-500" />
        <span className="text-muted-foreground/60 shrink-0 w-24">{label}</span>
        <span className="text-red-400 break-all">
          {regStr || <span className="italic text-muted-foreground/40">empty</span>}
        </span>
      </div>
      <div className="flex w-1/2 items-start gap-1.5 bg-green-500/10 px-3 py-1">
        <Plus className="mt-0.5 size-3 shrink-0 text-green-500" />
        <span className="text-muted-foreground/60 shrink-0 w-24">{label}</span>
        <span className="text-green-400 break-all">
          {crmStr || <span className="italic text-muted-foreground/40">empty</span>}
        </span>
      </div>
    </div>
  )
}

function DiffBlockHeader({ id, status, score }: { id: string; status: string; score: number | null }) {
  return (
    <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-3 py-2">
      <code className="text-xs font-semibold text-foreground/80">{id}</code>
      <DiffStatusBadge status={status} />
      {score !== null && (
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500',
              )}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{score}%</span>
        </div>
      )}
    </div>
  )
}

function DiffBlockColumns() {
  return (
    <div className="flex border-b border-border/30 bg-muted/10 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
      <div className="flex w-1/2 items-center gap-1.5 px-3 py-1 border-r border-border/30">
        <Minus className="size-3 text-red-400" />
        Registry
      </div>
      <div className="flex w-1/2 items-center gap-1.5 px-3 py-1">
        <Plus className="size-3 text-green-400" />
        CRM
      </div>
    </div>
  )
}

function LandDiffBlock({ row }: { row: LandDiffViewDto }) {
  const isOnlyRegistry = row.diffStatus === 'NEW_IN_REGISTRY'
  const isOnlyCrm = row.diffStatus === 'MISSING_IN_REGISTRY'

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 font-mono text-xs">
      <DiffBlockHeader
        id={`${row.cadastralNumber} · ${fmtDate(row.registryStateRegistrationDate ?? row.crmStateRegistrationDate)}`}
        status={row.diffStatus}
        score={row.similarityScore}
      />
      <DiffBlockColumns />
      <div className="divide-y divide-border/20">
        <DiffRow
          label="user"
          registryVal={row.registryUser}
          crmVal={row.crmUser}
          onlyRegistry={isOnlyRegistry}
          onlyCrm={isOnlyCrm}
        />
        <DiffRow
          label="square"
          registryVal={row.registrySquare}
          crmVal={row.crmSquare}
          onlyRegistry={isOnlyRegistry}
          onlyCrm={isOnlyCrm}
        />
        <DiffRow
          label="est_value"
          registryVal={row.registryEstimateValue}
          crmVal={row.crmEstimateValue}
          onlyRegistry={isOnlyRegistry}
          onlyCrm={isOnlyCrm}
        />
        <DiffRow
          label="location"
          registryVal={row.registryLocation}
          crmVal={row.crmLocation}
          onlyRegistry={isOnlyRegistry}
          onlyCrm={isOnlyCrm}
        />
      </div>
    </div>
  )
}

function RealtyDiffBlock({ row }: { row: RealtyDiffViewDto }) {
  const isOnlyRegistry = row.diffStatus === 'NEW_IN_REGISTRY'
  const isOnlyCrm = row.diffStatus === 'MISSING_IN_REGISTRY'

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 font-mono text-xs">
      <DiffBlockHeader
        id={`${row.stateTaxId} · ${fmtDate(row.ownershipRegistrationDate)}`}
        status={row.diffStatus}
        score={row.similarityScore}
      />
      <DiffBlockColumns />
      <div className="divide-y divide-border/20">
        <DiffRow
          label="name"
          registryVal={row.registryTaxpayerName}
          crmVal={row.crmTaxpayerName}
          onlyRegistry={isOnlyRegistry}
          onlyCrm={isOnlyCrm}
        />
        <DiffRow
          label="address"
          registryVal={row.registryAddress}
          crmVal={row.crmAddress}
          onlyRegistry={isOnlyRegistry}
          onlyCrm={isOnlyCrm}
        />
        <DiffRow
          label="total_area"
          registryVal={row.registryTotalArea}
          crmVal={row.crmTotalArea}
          onlyRegistry={isOnlyRegistry}
          onlyCrm={isOnlyCrm}
        />
        <DiffRow
          label="own_share"
          registryVal={row.registryOwnershipShare}
          crmVal={row.crmOwnershipShare}
          onlyRegistry={isOnlyRegistry}
          onlyCrm={isOnlyCrm}
        />
      </div>
    </div>
  )
}

export function DiffPage({ entity }: DiffPageProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [entity])

  const isLand = entity === 'Land'
  const landQuery = useLandDiffList(page, pageSize)
  const realtyQuery = useRealtyDiffList(page, pageSize)
  const activeQuery = isLand ? landQuery : realtyQuery

  const totalItems = activeQuery.data?.totalItems ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const errorMessage = activeQuery.error instanceof Error ? activeQuery.error.message : 'Unable to load data.'
  const currentItemsCount = isLand ? (landQuery.data?.items.length ?? 0) : (realtyQuery.data?.items.length ?? 0)
  const fromItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const toItem = totalItems === 0 ? 0 : fromItem + Math.max(0, currentItemsCount - 1)

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  const paginationWindow = useMemo(() => {
    const firstVisible = Math.max(1, page - 2)
    const lastVisible = Math.min(totalPages, firstVisible + 4)
    const start = Math.max(1, lastVisible - 4)
    return Array.from({ length: lastVisible - start + 1 }, (_, i) => start + i)
  }, [page, totalPages])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto flex h-full w-full max-w-310 flex-col gap-4">
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="border-b bg-muted/20 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="inline-flex w-fit items-center rounded-lg bg-muted p-1">
                <Link
                  to="/diff/land"
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors',
                    isLand
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-background hover:text-foreground',
                  )}
                >
                  <MapPinned className="size-3.5" />
                  Land
                </Link>
                <Link
                  to="/diff/realty"
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors',
                    !isLand
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-background hover:text-foreground',
                  )}
                >
                  <Building2 className="size-3.5" />
                  Realty
                </Link>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Minus className="size-3 text-red-400" /> registry
                </span>
                <span className="flex items-center gap-1">
                  <Plus className="size-3 text-green-400" /> crm
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 sm:p-6">
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{entity} Diff</h1>
              <span className="text-sm text-muted-foreground">{totalItems} discrepancies</span>
            </div>

            {activeQuery.isError && (
              <Alert variant="destructive">
                <AlertTitle>Failed to load diff records</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {activeQuery.isPending && !activeQuery.data ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            ) : totalItems === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">No discrepancies found</div>
            ) : (
              <div className="space-y-3">
                {isLand
                  ? (landQuery.data?.items ?? []).map((row) => <LandDiffBlock key={row.cadastralNumber} row={row} />)
                  : (realtyQuery.data?.items ?? []).map((row) => (
                      <RealtyDiffBlock key={`${row.stateTaxId}-${row.ownershipRegistrationDate}`} row={row} />
                    ))}
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Show Results :</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value))
                setPage(1)
              }}
            >
              <SelectTrigger size="sm" className="h-8 min-w-20">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {totalItems > 0 ? `${fromItem}-${toItem} of ${totalItems}` : '0 of 0'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || activeQuery.isFetching}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>

            {paginationWindow.map((pageNumber) => (
              <Button
                key={pageNumber}
                size="sm"
                variant={pageNumber === page ? 'default' : 'outline'}
                className={cn('h-8 min-w-8 px-2', pageNumber === page && 'pointer-events-none')}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || activeQuery.isFetching}
              aria-label="Next page"
            >
              {activeQuery.isFetching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
