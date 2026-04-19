import type { ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { useEffect, useId, useMemo, useState } from 'react'
import { Building2, ChevronLeft, ChevronRight, Loader2, MapPinned, Plus, Search, Trash2 } from 'lucide-react'
import type { LandRegistryDto, RealtyRegistryDto } from 'shared'

import {
  useClearCrmData,
  useDeleteLandCrmRecord,
  useDeleteRealtyCrmRecord,
  useLandRegistryList,
  useRealtyRegistryList,
  useRegistryInvalidCount,
  useRegistryLocationSuggestions,
  type RegistryEntity,
  type RegistryScope,
} from '@/hooks/use-registry'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { getRequestErrorMessage, toDateInputValue } from './crm-form-utils'
import { LandCrmDialog } from './land-crm-dialog'
import { landColumns } from './land-columns'
import { RealtyCrmDialog } from './realty-crm-dialog'
import { realtyColumns } from './realty-columns'
import { RegistryDeleteDialog } from './registry-delete-dialog'
import { RegistryRowActions } from './registry-row-actions'

interface RegistryPageProps {
  scope: RegistryScope
  entity: RegistryEntity
}

const DEFAULT_PAGE_SIZE = 15
const PAGE_SIZE_OPTIONS = [10, 15, 25, 50]

interface LandDialogState {
  open: boolean
  mode: 'create' | 'edit'
  cadastralNumber: string | null
}

interface RealtyDialogState {
  open: boolean
  mode: 'create' | 'edit'
  recordKey: { stateTaxId: string; ownershipRegistrationDate: string } | null
}

const initialLandDialogState: LandDialogState = {
  open: false,
  mode: 'create',
  cadastralNumber: null,
}

const initialRealtyDialogState: RealtyDialogState = {
  open: false,
  mode: 'create',
  recordKey: null,
}

export function RegistryPage({ scope, entity }: RegistryPageProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [locationInput, setLocationInput] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [landDialogState, setLandDialogState] = useState<LandDialogState>(initialLandDialogState)
  const [realtyDialogState, setRealtyDialogState] = useState<RealtyDialogState>(initialRealtyDialogState)
  const [landDeleteTarget, setLandDeleteTarget] = useState<LandRegistryDto | null>(null)
  const [realtyDeleteTarget, setRealtyDeleteTarget] = useState<RealtyRegistryDto | null>(null)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [landActionError, setLandActionError] = useState<string | null>(null)
  const [realtyActionError, setRealtyActionError] = useState<string | null>(null)
  const [clearActionError, setClearActionError] = useState<string | null>(null)
  const datalistId = useId()

  const isLand = entity === 'Land'
  const isLocalScope = scope === 'Local Registry'
  const landRoute = scope === 'Global Registry' ? '/global-registry/land' : '/local-registry/land'
  const realtyRoute = scope === 'Global Registry' ? '/global-registry/realty' : '/local-registry/realty'

  const landDeleteMutation = useDeleteLandCrmRecord()
  const realtyDeleteMutation = useDeleteRealtyCrmRecord()
  const clearCrmMutation = useClearCrmData()

  useEffect(() => {
    setPage(1)
    setLandDialogState(initialLandDialogState)
    setRealtyDialogState(initialRealtyDialogState)
    setLandDeleteTarget(null)
    setRealtyDeleteTarget(null)
    setClearDialogOpen(false)
    setLandActionError(null)
    setRealtyActionError(null)
    setClearActionError(null)
  }, [scope, entity])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchValue(locationInput.trim())
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [locationInput])

  useEffect(() => {
    setPage(1)
  }, [searchValue])

  const landQuery = useLandRegistryList(page, pageSize, {
    scope,
    location: searchValue,
    enabled: isLand,
  })
  const realtyQuery = useRealtyRegistryList(page, pageSize, {
    scope,
    location: searchValue,
    enabled: !isLand,
  })
  const activeQuery = isLand ? landQuery : realtyQuery
  const locationSuggestionsQuery = useRegistryLocationSuggestions(scope, entity, locationInput, {
    enabled: locationInput.trim().length >= 3,
  })
  const invalidCountQuery = useRegistryInvalidCount(scope, entity)

  const totalItems = activeQuery.data?.totalItems ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const errorMessage = activeQuery.error instanceof Error ? activeQuery.error.message : 'Unable to load data.'
  const locationSuggestions = locationSuggestionsQuery.data ?? []
  const currentItemsCount = isLand ? (landQuery.data?.items.length ?? 0) : (realtyQuery.data?.items.length ?? 0)
  const fromItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const toItem = totalItems === 0 ? 0 : fromItem + Math.max(0, currentItemsCount - 1)

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages))
  }, [totalPages])

  const paginationWindow = useMemo(() => {
    const firstVisible = Math.max(1, page - 2)
    const lastVisible = Math.min(totalPages, firstVisible + 4)
    const start = Math.max(1, lastVisible - 4)

    return Array.from({ length: lastVisible - start + 1 }, (_, index) => start + index)
  }, [page, totalPages])

  const landTableColumns = useMemo<ColumnDef<LandRegistryDto>[]>(() => {
    if (!isLocalScope) {
      return landColumns
    }

    return [
      ...landColumns,
      {
        id: 'actions',
        header: () => <div className="w-9" aria-hidden="true" />,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RegistryRowActions
              recordLabel={row.original.cadastralNumber}
              onEdit={() => {
                setLandActionError(null)
                setLandDialogState({
                  open: true,
                  mode: 'edit',
                  cadastralNumber: row.original.cadastralNumber,
                })
              }}
              onDelete={() => {
                setLandActionError(null)
                setLandDeleteTarget(row.original)
              }}
            />
          </div>
        ),
        enableSorting: false,
        size: 44,
      },
    ]
  }, [isLocalScope])

  const realtyTableColumns = useMemo<ColumnDef<RealtyRegistryDto>[]>(() => {
    if (!isLocalScope) {
      return realtyColumns
    }

    return [
      ...realtyColumns,
      {
        id: 'actions',
        header: () => <div className="w-9" aria-hidden="true" />,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RegistryRowActions
              recordLabel={`${row.original.stateTaxId}/${toDateInputValue(row.original.ownershipRegistrationDate)}`}
              onEdit={() => {
                setRealtyActionError(null)
                setRealtyDialogState({
                  open: true,
                  mode: 'edit',
                  recordKey: {
                    stateTaxId: row.original.stateTaxId,
                    ownershipRegistrationDate: toDateInputValue(row.original.ownershipRegistrationDate),
                  },
                })
              }}
              onDelete={() => {
                setRealtyActionError(null)
                setRealtyDeleteTarget(row.original)
              }}
            />
          </div>
        ),
        enableSorting: false,
        size: 44,
      },
    ]
  }, [isLocalScope])

  async function handleLandDelete() {
    if (!landDeleteTarget) {
      return
    }

    setLandActionError(null)

    try {
      await landDeleteMutation.mutateAsync(landDeleteTarget.cadastralNumber)
      setLandDeleteTarget(null)
    } catch (error) {
      setLandActionError(getRequestErrorMessage(error, 'Failed to delete land record'))
    }
  }

  async function handleRealtyDelete() {
    if (!realtyDeleteTarget) {
      return
    }

    setRealtyActionError(null)

    try {
      await realtyDeleteMutation.mutateAsync({
        stateTaxId: realtyDeleteTarget.stateTaxId,
        ownershipRegistrationDate: toDateInputValue(realtyDeleteTarget.ownershipRegistrationDate),
      })
      setRealtyDeleteTarget(null)
    } catch (error) {
      setRealtyActionError(getRequestErrorMessage(error, 'Failed to delete realty record'))
    }
  }

  async function handleClearCrmData() {
    setClearActionError(null)

    try {
      await clearCrmMutation.mutateAsync()
      setClearDialogOpen(false)
      setPage(1)
    } catch (error) {
      setClearActionError(getRequestErrorMessage(error, 'Failed to clear CRM data'))
    }
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto flex w-full max-w-310 flex-col gap-4">
        <section className="flex flex-col gap-4">
          <div className="px-2 py-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="inline-flex w-fit items-center gap-1 rounded-lg bg-transparent p-0">
                <Link
                  to={landRoute}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors',
                    isLand
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  )}
                >
                  <MapPinned className="size-3.5" />
                  Land
                </Link>
                <Link
                  to={realtyRoute}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors',
                    !isLand
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  )}
                >
                  <Building2 className="size-3.5" />
                  Realty
                </Link>
              </div>

              <div className="relative min-w-0 md:w-60">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={locationInput}
                  onChange={(event) => setLocationInput(event.target.value)}
                  list={datalistId}
                  placeholder={isLand ? 'Search location' : 'Search address'}
                  className="h-8 rounded-md border-0 bg-transparent pl-9 text-xs shadow-none ring-1 ring-border/30 focus-visible:ring-border/60 focus-visible:ring-offset-0"
                />
                <datalist id={datalistId}>
                  {locationSuggestions.map((value) => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div className="space-y-3 px-2">
            {isLocalScope ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs shadow-none"
                  onClick={() => {
                    if (isLand) {
                      setLandDialogState({
                        open: true,
                        mode: 'create',
                        cadastralNumber: null,
                      })
                      return
                    }

                    setRealtyDialogState({
                      open: true,
                      mode: 'create',
                      recordKey: null,
                    })
                  }}
                >
                  <Plus className="size-3.5" />
                  {isLand ? 'Add land record' : 'Add realty record'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setClearActionError(null)
                    setClearDialogOpen(true)
                  }}
                  disabled={clearCrmMutation.isPending}
                >
                  {clearCrmMutation.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  Clear CRM data
                </Button>
              </div>
            ) : null}

            <div className="flex items-baseline justify-between">
              <h1 className="text-xl font-bold tracking-tight">
                {entity} <span className="ml-1 text-sm font-normal text-muted-foreground">{totalItems} results</span>
              </h1>
              <div className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground">
                  Errors: <span className="font-medium text-destructive">{invalidCountQuery.data ?? 0}</span>
                </div>
                <Link to="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  To dif
                </Link>
              </div>
            </div>

            {activeQuery.isError ? (
              <Alert variant="destructive">
                <AlertTitle>Failed to load registry records</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            {activeQuery.isPending && !activeQuery.data ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : isLand ? (
              <DataTable columns={landTableColumns} data={landQuery.data?.items ?? []} showPaginationControls={false} />
            ) : (
              <DataTable
                columns={realtyTableColumns}
                data={realtyQuery.data?.items ?? []}
                showPaginationControls={false}
              />
            )}
          </div>
        </section>

        <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
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

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={page <= 1 || activeQuery.isFetching}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>

            {paginationWindow.map((pageNumber) => (
              <Button
                key={pageNumber}
                size="sm"
                variant={pageNumber === page ? 'secondary' : 'ghost'}
                className={cn('h-8 min-w-8 px-2', pageNumber === page && 'pointer-events-none')}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
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

        {isLocalScope && isLand ? (
          <>
            <LandCrmDialog
              open={landDialogState.open}
              mode={landDialogState.mode}
              cadastralNumber={landDialogState.cadastralNumber}
              onOpenChange={(open) => {
                if (!open) {
                  setLandDialogState(initialLandDialogState)
                  return
                }

                setLandDialogState((currentState) => ({ ...currentState, open }))
              }}
            />
            <RegistryDeleteDialog
              open={Boolean(landDeleteTarget)}
              onOpenChange={(open) => {
                if (!open) {
                  setLandDeleteTarget(null)
                  setLandActionError(null)
                }
              }}
              title="Delete land record"
              description={
                landDeleteTarget
                  ? `Delete cadastral number ${landDeleteTarget.cadastralNumber} from the local CRM registry. This action cannot be undone.`
                  : 'Delete this land record from the local CRM registry.'
              }
              confirmLabel="Delete record"
              onConfirm={handleLandDelete}
              isPending={landDeleteMutation.isPending}
              errorMessage={landActionError}
            />
          </>
        ) : null}

        {isLocalScope && !isLand ? (
          <>
            <RealtyCrmDialog
              open={realtyDialogState.open}
              mode={realtyDialogState.mode}
              recordKey={realtyDialogState.recordKey}
              onOpenChange={(open) => {
                if (!open) {
                  setRealtyDialogState(initialRealtyDialogState)
                  return
                }

                setRealtyDialogState((currentState) => ({ ...currentState, open }))
              }}
            />
            <RegistryDeleteDialog
              open={Boolean(realtyDeleteTarget)}
              onOpenChange={(open) => {
                if (!open) {
                  setRealtyDeleteTarget(null)
                  setRealtyActionError(null)
                }
              }}
              title="Delete realty record"
              description={
                realtyDeleteTarget
                  ? `Delete ${realtyDeleteTarget.stateTaxId} registered on ${toDateInputValue(
                      realtyDeleteTarget.ownershipRegistrationDate,
                    )} from the local CRM registry. This action cannot be undone.`
                  : 'Delete this realty record from the local CRM registry.'
              }
              confirmLabel="Delete record"
              onConfirm={handleRealtyDelete}
              isPending={realtyDeleteMutation.isPending}
              errorMessage={realtyActionError}
            />
          </>
        ) : null}

        {isLocalScope ? (
          <RegistryDeleteDialog
            open={clearDialogOpen}
            onOpenChange={(open) => {
              setClearDialogOpen(open)
              if (!open) {
                setClearActionError(null)
              }
            }}
            title="Clear local CRM data"
            description="This removes all land and realty records from the local CRM registry. Use it only when you intentionally want a full reset before a new import."
            confirmLabel="Clear data"
            onConfirm={handleClearCrmData}
            isPending={clearCrmMutation.isPending}
            errorMessage={clearActionError}
          />
        ) : null}
      </div>
    </TooltipProvider>
  )
}
