import { Link } from '@tanstack/react-router'
import { useEffect, useId, useMemo, useState } from 'react'
import { Building2, Database, Globe2, Loader2, MapPinned, RefreshCcw, Search } from 'lucide-react'

import {
  useLandRegistryList,
  useRealtyRegistryList,
  useRegistryLocationSuggestions,
  type RegistryEntity,
  type RegistryScope,
} from '@/hooks/use-registry'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { landColumns } from './land-columns'
import { realtyColumns } from './realty-columns'

interface RegistryPageProps {
  scope: RegistryScope
  entity: RegistryEntity
}

const PAGE_SIZE = 10

export function RegistryPage({ scope, entity }: RegistryPageProps) {
  const [page, setPage] = useState(1)
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

  const ScopeIcon = scope === 'Global Registry' ? Globe2 : Database
  const EntityIcon = entity === 'Land' ? MapPinned : Building2
  const isLand = entity === 'Land'
  const scopeBaseRoute = scope === 'Global Registry' ? '/global-registry' : '/local-registry'
  const landRoute = scope === 'Global Registry' ? '/global-registry/land' : '/local-registry/land'
  const realtyRoute = scope === 'Global Registry' ? '/global-registry/realty' : '/local-registry/realty'

  const landQuery = useLandRegistryList(page, PAGE_SIZE, {
    scope,
    location: searchValue,
    enabled: isLand,
  })
  const realtyQuery = useRealtyRegistryList(page, PAGE_SIZE, {
    scope,
    location: searchValue,
    enabled: !isLand,
  })
  const activeQuery = isLand ? landQuery : realtyQuery
  const locationSuggestionsQuery = useRegistryLocationSuggestions(scope, entity, locationInput, {
    enabled: locationInput.trim().length >= 3,
  })

  const totalItems = activeQuery.data?.totalItems ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const fromItem = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const toItem = Math.min(page * PAGE_SIZE, totalItems)
  const errorMessage = activeQuery.error instanceof Error ? activeQuery.error.message : 'Unable to load data.'
  const locationSuggestions = locationSuggestionsQuery.data ?? []

  const paginationWindow = useMemo(() => {
    const firstVisible = Math.max(1, page - 2)
    const lastVisible = Math.min(totalPages, firstVisible + 4)
    const start = Math.max(1, lastVisible - 4)

    return Array.from({ length: lastVisible - start + 1 }, (_, index) => start + index)
  }, [page, totalPages])

  return (
    <div className="mx-auto flex h-full w-full max-w-[1240px] flex-col gap-4">
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-muted/30 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              asChild
              size="sm"
              variant={isLand ? 'default' : 'secondary'}
              className="h-8 gap-2 rounded-md px-3 text-xs font-semibold"
            >
              <Link to={landRoute}>
                <MapPinned className="size-3.5" />
                Land
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant={isLand ? 'secondary' : 'default'}
              className="h-8 gap-2 rounded-md px-3 text-xs font-semibold"
            >
              <Link to={realtyRoute}>
                <Building2 className="size-3.5" />
                Realty
              </Link>
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="h-8 rounded-md px-3 text-xs">
                <ScopeIcon className="size-3.5" />
                {scope}
              </Badge>
              <Badge variant="outline" className="h-8 rounded-md px-3 text-xs">
                <EntityIcon className="size-3.5" />
                {entity}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{scope}</h1>
              <p className="text-sm text-muted-foreground">
                {searchValue
                  ? `Location filter applied: ${searchValue}`
                  : `Showing ${entity.toLowerCase()} records with server-side pagination`}
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <div className="relative min-w-0 flex-1 sm:min-w-72">
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

              <Button variant="outline" size="sm" className="h-9" onClick={() => activeQuery.refetch()}>
                {activeQuery.isFetching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCcw className="size-4" />
                )}
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9"
                onClick={() => setLocationInput('')}
                disabled={!locationInput}
              >
                Clear
              </Button>
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
              <DataTable
                columns={isLand ? landColumns : realtyColumns}
                data={isLand ? (landQuery.data?.items ?? []) : (realtyQuery.data?.items ?? [])}
                showPaginationControls={false}
              />

              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {totalItems > 0
                    ? `Showing ${fromItem}-${toItem} of ${totalItems} records`
                    : 'No records found for this page.'}
                </p>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                    disabled={page <= 1 || activeQuery.isFetching}
                  >
                    Previous
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
                    size="sm"
                    onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                    disabled={page >= totalPages || activeQuery.isFetching}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}

          <p className="text-xs text-muted-foreground">
            Source: {scopeBaseRoute === '/global-registry' ? '/registry/*/search' : '/crm/*/search'} and location
            suggestions endpoint.
          </p>
        </div>
      </section>
    </div>
  )
}
