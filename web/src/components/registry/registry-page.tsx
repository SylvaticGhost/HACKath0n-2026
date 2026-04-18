import { Link } from '@tanstack/react-router'
import { useEffect, useId, useMemo, useState } from 'react'
import { Building2, ChevronLeft, ChevronRight, Loader2, MapPinned, Search } from 'lucide-react'

import {
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
import { landColumns } from './land-columns'
import { realtyColumns } from './realty-columns'

interface RegistryPageProps {
  scope: RegistryScope
  entity: RegistryEntity
}

const DEFAULT_PAGE_SIZE = 15
const PAGE_SIZE_OPTIONS = [10, 15, 25, 50]

export function RegistryPage({ scope, entity }: RegistryPageProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [locationInput, setLocationInput] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const datalistId = useId()

  useEffect(() => {
    setPage(1)
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

  const isLand = entity === 'Land'
  const landRoute = scope === 'Global Registry' ? '/global-registry/land' : '/local-registry/land'
  const realtyRoute = scope === 'Global Registry' ? '/global-registry/realty' : '/local-registry/realty'

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

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto flex h-full w-full max-w-310 flex-col gap-4">
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="border-b bg-muted/20 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="inline-flex w-fit items-center rounded-lg bg-muted p-1">
                <Link
                  to={landRoute}
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
                  to={realtyRoute}
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

              <div className="relative min-w-0 md:w-80">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={locationInput}
                  onChange={(event) => setLocationInput(event.target.value)}
                  list={datalistId}
                  placeholder={isLand ? 'Search by location...' : 'Search by object address...'}
                  className="h-9 pl-9"
                />
                <datalist id={datalistId}>
                  {locationSuggestions.map((value) => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 sm:p-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {entity} ({totalItems})
              </h1>
              <div className="text-sm text-muted-foreground">
                Invalid total: <span className="font-semibold text-destructive">{invalidCountQuery.data ?? 0}</span>
              </div>
            </div>

            {activeQuery.isError && (
              <Alert variant="destructive">
                <AlertTitle>Failed to load registry records</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {activeQuery.isPending && !activeQuery.data ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <>
                {isLand ? (
                  <DataTable columns={landColumns} data={landQuery.data?.items ?? []} showPaginationControls={false} />
                ) : (
                  <DataTable
                    columns={realtyColumns}
                    data={realtyQuery.data?.items ?? []}
                    showPaginationControls={false}
                  />
                )}
              </>
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

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
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
      </div>
    </TooltipProvider>
  )
}
