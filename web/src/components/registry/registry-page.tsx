import { useEffect, useState } from 'react'
import { Building2, Database, Globe2, Loader2, MapPinned, RefreshCcw } from 'lucide-react'

import { useLandRegistryList, useRealtyRegistryList } from '@/hooks/use-registry'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { landColumns } from './land-columns'
import { realtyColumns } from './realty-columns'

type RegistryScope = 'Global Registry' | 'Local Registry'
type RegistryEntity = 'Land' | 'Realty'

interface RegistryPageProps {
  scope: RegistryScope
  entity: RegistryEntity
}

const PAGE_SIZE = 10

export function RegistryPage({ scope, entity }: RegistryPageProps) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [scope, entity])

  const ScopeIcon = scope === 'Global Registry' ? Globe2 : Database
  const EntityIcon = entity === 'Land' ? MapPinned : Building2
  const isLand = entity === 'Land'

  const landQuery = useLandRegistryList(page, PAGE_SIZE, { enabled: isLand })
  const realtyQuery = useRealtyRegistryList(page, PAGE_SIZE, { enabled: !isLand })
  const activeQuery = isLand ? landQuery : realtyQuery

  const totalItems = activeQuery.data?.totalItems ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const fromItem = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const toItem = Math.min(page * PAGE_SIZE, totalItems)
  const errorMessage = activeQuery.error instanceof Error ? activeQuery.error.message : 'Unable to load data.'

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="secondary">
              <ScopeIcon className="size-3" />
              {scope}
            </Badge>
            <Badge variant="outline">
              <EntityIcon className="size-3" />
              {entity}
            </Badge>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                {scope}: {entity}
              </CardTitle>
              <CardDescription>
                Data is loaded from backend registry endpoints with server-side pagination.
              </CardDescription>
            </div>

            <Button variant="outline" size="sm" onClick={() => activeQuery.refetch()} disabled={activeQuery.isFetching}>
              {activeQuery.isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
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

              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {totalItems > 0
                    ? `Showing ${fromItem}-${toItem} of ${totalItems} records`
                    : 'No records found for this page.'}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                    disabled={page <= 1 || activeQuery.isFetching}
                  >
                    Previous
                  </Button>

                  <span className="min-w-24 text-center text-sm text-muted-foreground">
                    Page {page} / {totalPages}
                  </span>

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
        </CardContent>
      </Card>
    </div>
  )
}
