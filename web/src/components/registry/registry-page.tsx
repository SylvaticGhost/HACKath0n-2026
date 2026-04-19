import type { ColumnDef, ColumnFiltersState, SortingState } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { useEffect, useId, useMemo, useState } from 'react'
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  MapPinned,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react'
import type { LandRegistryDto, LandSearchDto, RealtyRegistryDto, RealtySearchDto } from 'shared'

import {
  useClearCrmData,
  useDeleteLandCrmRecord,
  useDeleteRealtyCrmRecord,
  useExportRegistry,
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
import { toast } from 'sonner'
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

type SortOrder = 'asc' | 'desc'
type LandSortField =
  | 'cadastralNumber'
  | 'location'
  | 'square'
  | 'estimateValue'
  | 'stateTaxId'
  | 'user'
  | 'stateRegistrationDate'
type RealtySortField =
  | 'stateTaxId'
  | 'ownershipRegistrationDate'
  | 'taxpayerName'
  | 'objectAddress'
  | 'totalArea'
  | 'ownershipShare'

interface RangeColumnFilterValue {
  min?: string
  max?: string
}

interface LandFilterFormState {
  cadastralNumber: string
  stateTaxId: string
  user: string
  squareMin: string
  squareMax: string
  estimateValueMin: string
  estimateValueMax: string
}

interface RealtyFilterFormState {
  stateTaxId: string
  taxpayerName: string
  totalAreaMin: string
  totalAreaMax: string
  ownershipShareMin: string
  ownershipShareMax: string
}

interface LandSortState {
  sortBy: LandSortField
  sortOrder: SortOrder
}

interface RealtySortState {
  sortBy: RealtySortField
  sortOrder: SortOrder
}

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

type StateUpdater<T> = T | ((previousState: T) => T)

const initialLandFilterState: LandFilterFormState = {
  cadastralNumber: '',
  stateTaxId: '',
  user: '',
  squareMin: '',
  squareMax: '',
  estimateValueMin: '',
  estimateValueMax: '',
}

const initialRealtyFilterState: RealtyFilterFormState = {
  stateTaxId: '',
  taxpayerName: '',
  totalAreaMin: '',
  totalAreaMax: '',
  ownershipShareMin: '',
  ownershipShareMax: '',
}

const initialLandSortState: LandSortState = { sortBy: 'cadastralNumber', sortOrder: 'asc' }
const initialRealtySortState: RealtySortState = { sortBy: 'stateTaxId', sortOrder: 'asc' }
const initialLandDialogState: LandDialogState = { open: false, mode: 'create', cadastralNumber: null }
const initialRealtyDialogState: RealtyDialogState = { open: false, mode: 'create', recordKey: null }

function parseOptionalNumber(value: string) {
  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return undefined
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

function hasTextValue(value: string) {
  return value.trim().length > 0
}

function resolveNextState<T>(updater: StateUpdater<T>, previousState: T) {
  return typeof updater === 'function' ? (updater as (previousState: T) => T)(previousState) : updater
}

function toRangeFilterValue(value: unknown): RangeColumnFilterValue {
  if (!value || typeof value !== 'object') {
    return {}
  }

  const candidate = value as RangeColumnFilterValue
  return {
    min: typeof candidate.min === 'string' ? candidate.min : '',
    max: typeof candidate.max === 'string' ? candidate.max : '',
  }
}

function buildLandColumnFilters(filters: LandFilterFormState): ColumnFiltersState {
  const columnFilters: ColumnFiltersState = []

  if (hasTextValue(filters.cadastralNumber)) {
    columnFilters.push({ id: 'cadastralNumber', value: filters.cadastralNumber })
  }

  if (hasTextValue(filters.stateTaxId)) {
    columnFilters.push({ id: 'stateTaxId', value: filters.stateTaxId })
  }

  if (hasTextValue(filters.user)) {
    columnFilters.push({ id: 'user', value: filters.user })
  }

  if (hasTextValue(filters.squareMin) || hasTextValue(filters.squareMax)) {
    columnFilters.push({
      id: 'square',
      value: {
        min: filters.squareMin,
        max: filters.squareMax,
      },
    })
  }

  if (hasTextValue(filters.estimateValueMin) || hasTextValue(filters.estimateValueMax)) {
    columnFilters.push({
      id: 'estimateValue',
      value: {
        min: filters.estimateValueMin,
        max: filters.estimateValueMax,
      },
    })
  }

  return columnFilters
}

function buildRealtyColumnFilters(filters: RealtyFilterFormState): ColumnFiltersState {
  const columnFilters: ColumnFiltersState = []

  if (hasTextValue(filters.stateTaxId)) {
    columnFilters.push({ id: 'stateTaxId', value: filters.stateTaxId })
  }

  if (hasTextValue(filters.taxpayerName)) {
    columnFilters.push({ id: 'taxpayerName', value: filters.taxpayerName })
  }

  if (hasTextValue(filters.totalAreaMin) || hasTextValue(filters.totalAreaMax)) {
    columnFilters.push({
      id: 'totalArea',
      value: {
        min: filters.totalAreaMin,
        max: filters.totalAreaMax,
      },
    })
  }

  if (hasTextValue(filters.ownershipShareMin) || hasTextValue(filters.ownershipShareMax)) {
    columnFilters.push({
      id: 'ownershipShare',
      value: {
        min: filters.ownershipShareMin,
        max: filters.ownershipShareMax,
      },
    })
  }

  return columnFilters
}

function mapLandColumnFilters(columnFilters: ColumnFiltersState): LandFilterFormState {
  const nextState = { ...initialLandFilterState }

  for (const filter of columnFilters) {
    switch (filter.id) {
      case 'cadastralNumber':
        nextState.cadastralNumber = typeof filter.value === 'string' ? filter.value : ''
        break
      case 'stateTaxId':
        nextState.stateTaxId = typeof filter.value === 'string' ? filter.value : ''
        break
      case 'user':
        nextState.user = typeof filter.value === 'string' ? filter.value : ''
        break
      case 'square': {
        const rangeValue = toRangeFilterValue(filter.value)
        nextState.squareMin = rangeValue.min ?? ''
        nextState.squareMax = rangeValue.max ?? ''
        break
      }
      case 'estimateValue': {
        const rangeValue = toRangeFilterValue(filter.value)
        nextState.estimateValueMin = rangeValue.min ?? ''
        nextState.estimateValueMax = rangeValue.max ?? ''
        break
      }
      default:
        break
    }
  }

  return nextState
}

function mapRealtyColumnFilters(columnFilters: ColumnFiltersState): RealtyFilterFormState {
  const nextState = { ...initialRealtyFilterState }

  for (const filter of columnFilters) {
    switch (filter.id) {
      case 'stateTaxId':
        nextState.stateTaxId = typeof filter.value === 'string' ? filter.value : ''
        break
      case 'taxpayerName':
        nextState.taxpayerName = typeof filter.value === 'string' ? filter.value : ''
        break
      case 'totalArea': {
        const rangeValue = toRangeFilterValue(filter.value)
        nextState.totalAreaMin = rangeValue.min ?? ''
        nextState.totalAreaMax = rangeValue.max ?? ''
        break
      }
      case 'ownershipShare': {
        const rangeValue = toRangeFilterValue(filter.value)
        nextState.ownershipShareMin = rangeValue.min ?? ''
        nextState.ownershipShareMax = rangeValue.max ?? ''
        break
      }
      default:
        break
    }
  }

  return nextState
}

function countLandActiveFilters(filters: LandFilterFormState, searchValue: string) {
  return [
    searchValue,
    filters.cadastralNumber,
    filters.stateTaxId,
    filters.user,
    filters.squareMin,
    filters.squareMax,
    filters.estimateValueMin,
    filters.estimateValueMax,
  ].filter(hasTextValue).length
}

function countRealtyActiveFilters(filters: RealtyFilterFormState, searchValue: string) {
  return [
    searchValue,
    filters.stateTaxId,
    filters.taxpayerName,
    filters.totalAreaMin,
    filters.totalAreaMax,
    filters.ownershipShareMin,
    filters.ownershipShareMax,
  ].filter(hasTextValue).length
}

export function RegistryPage({ scope, entity }: RegistryPageProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [locationInput, setLocationInput] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [landFilters, setLandFilters] = useState<LandFilterFormState>(initialLandFilterState)
  const [realtyFilters, setRealtyFilters] = useState<RealtyFilterFormState>(initialRealtyFilterState)
  const [landSortState, setLandSortState] = useState<LandSortState>(initialLandSortState)
  const [realtySortState, setRealtySortState] = useState<RealtySortState>(initialRealtySortState)
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
  const diffRoute = isLand ? '/diff/land' : '/diff/realty'

  const landDeleteMutation = useDeleteLandCrmRecord()
  const realtyDeleteMutation = useDeleteRealtyCrmRecord()
  const clearCrmMutation = useClearCrmData()
  const exportRegistryMutation = useExportRegistry()

  useEffect(() => {
    setPage(1)
    setPageSize(DEFAULT_PAGE_SIZE)
    setLocationInput('')
    setSearchValue('')
    setLandFilters(initialLandFilterState)
    setRealtyFilters(initialRealtyFilterState)
    setLandSortState(initialLandSortState)
    setRealtySortState(initialRealtySortState)
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

  const landSearchFilters = useMemo<LandSearchDto>(
    () => ({
      cadastralNumber: landFilters.cadastralNumber || undefined,
      stateTaxId: landFilters.stateTaxId || undefined,
      user: landFilters.user || undefined,
      location: searchValue || undefined,
      squareMin: parseOptionalNumber(landFilters.squareMin),
      squareMax: parseOptionalNumber(landFilters.squareMax),
      estimateValueMin: parseOptionalNumber(landFilters.estimateValueMin),
      estimateValueMax: parseOptionalNumber(landFilters.estimateValueMax),
      sortBy: landSortState.sortBy,
      sortOrder: landSortState.sortOrder,
    }),
    [landFilters, landSortState, searchValue],
  )

  const realtySearchFilters = useMemo<RealtySearchDto>(
    () => ({
      stateTaxId: realtyFilters.stateTaxId || undefined,
      taxpayerName: realtyFilters.taxpayerName || undefined,
      objectAddress: searchValue || undefined,
      totalAreaMin: parseOptionalNumber(realtyFilters.totalAreaMin),
      totalAreaMax: parseOptionalNumber(realtyFilters.totalAreaMax),
      ownershipShareMin: parseOptionalNumber(realtyFilters.ownershipShareMin),
      ownershipShareMax: parseOptionalNumber(realtyFilters.ownershipShareMax),
      sortBy: realtySortState.sortBy,
      sortOrder: realtySortState.sortOrder,
    }),
    [realtyFilters, realtySortState, searchValue],
  )

  const activeQuerySignature = isLand ? JSON.stringify(landSearchFilters) : JSON.stringify(realtySearchFilters)

  useEffect(() => {
    setPage(1)
  }, [activeQuerySignature])

  const landQuery = useLandRegistryList(page, pageSize, { scope, filters: landSearchFilters, enabled: isLand })
  const realtyQuery = useRealtyRegistryList(page, pageSize, {
    scope,
    filters: realtySearchFilters,
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

  const landSorting = useMemo<SortingState>(
    () => [{ id: landSortState.sortBy, desc: landSortState.sortOrder === 'desc' }],
    [landSortState],
  )
  const realtySorting = useMemo<SortingState>(
    () => [{ id: realtySortState.sortBy, desc: realtySortState.sortOrder === 'desc' }],
    [realtySortState],
  )

  const landColumnFilters = useMemo(() => buildLandColumnFilters(landFilters), [landFilters])
  const realtyColumnFilters = useMemo(() => buildRealtyColumnFilters(realtyFilters), [realtyFilters])

  function handleLandSortingChange(updater: StateUpdater<SortingState>) {
    const nextSorting = resolveNextState(updater, landSorting)
    const nextSort = nextSorting[0]

    if (!nextSort) {
      setLandSortState(initialLandSortState)
      return
    }

    setLandSortState({
      sortBy: nextSort.id as LandSortField,
      sortOrder: nextSort.desc ? 'desc' : 'asc',
    })
  }

  function handleRealtySortingChange(updater: StateUpdater<SortingState>) {
    const nextSorting = resolveNextState(updater, realtySorting)
    const nextSort = nextSorting[0]

    if (!nextSort) {
      setRealtySortState(initialRealtySortState)
      return
    }

    setRealtySortState({
      sortBy: nextSort.id as RealtySortField,
      sortOrder: nextSort.desc ? 'desc' : 'asc',
    })
  }

  function handleLandColumnFiltersChange(updater: StateUpdater<ColumnFiltersState>) {
    const nextColumnFilters = resolveNextState(updater, landColumnFilters)
    setLandFilters(mapLandColumnFilters(nextColumnFilters))
  }

  function handleRealtyColumnFiltersChange(updater: StateUpdater<ColumnFiltersState>) {
    const nextColumnFilters = resolveNextState(updater, realtyColumnFilters)
    setRealtyFilters(mapRealtyColumnFilters(nextColumnFilters))
  }

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

  const activeFilterCount = isLand
    ? countLandActiveFilters(landFilters, searchValue)
    : countRealtyActiveFilters(realtyFilters, searchValue)
  const hasNonDefaultSorting = isLand
    ? landSortState.sortBy !== initialLandSortState.sortBy || landSortState.sortOrder !== initialLandSortState.sortOrder
    : realtySortState.sortBy !== initialRealtySortState.sortBy ||
      realtySortState.sortOrder !== initialRealtySortState.sortOrder
  const canResetFilters = activeFilterCount > 0 || hasNonDefaultSorting

  async function handleExport() {
    try {
      const blob = await exportRegistryMutation.mutateAsync(
        isLand ? { entity: 'Land', filters: landSearchFilters } : { entity: 'Realty', filters: realtySearchFilters },
      )

      const downloadUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = isLand ? 'land.xlsx' : 'realty.xlsx'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(downloadUrl)

      toast.success(`${entity} export downloaded`)
    } catch (error) {
      toast.error(getRequestErrorMessage(error, `Failed to export ${entity.toLowerCase()} records`))
    }
  }

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

  function handleResetAll() {
    setLocationInput('')
    setSearchValue('')
    setLandFilters(initialLandFilterState)
    setRealtyFilters(initialRealtyFilterState)
    setLandSortState(initialLandSortState)
    setRealtySortState(initialRealtySortState)
  }

  const tableToolbar = (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-1 flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative min-w-0 lg:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={locationInput}
            onChange={(event) => setLocationInput(event.target.value)}
            list={datalistId}
            placeholder={isLand ? 'Search location' : 'Search address'}
            className="h-8 rounded-full border-border/40 bg-background pl-9 text-xs shadow-none"
          />
          <datalist id={datalistId}>
            {locationSuggestions.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
        </div>

        {canResetFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-full px-3 text-xs"
            onClick={handleResetAll}
          >
            <RotateCcw className="mr-2 size-3.5" />
            Reset {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Button>
        ) : null}
      </div>

      {isLocalScope ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full px-3 text-xs shadow-none"
            onClick={handleExport}
            disabled={exportRegistryMutation.isPending || totalItems === 0}
          >
            {exportRegistryMutation.isPending ? (
              <Loader2 className="mr-2 size-3.5 animate-spin" />
            ) : (
              <Download className="mr-2 size-3.5" />
            )}
            Export XLSX
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full px-3 text-xs shadow-none"
            onClick={() => {
              if (isLand) {
                setLandDialogState({ open: true, mode: 'create', cadastralNumber: null })
                return
              }

              setRealtyDialogState({ open: true, mode: 'create', recordKey: null })
            }}
          >
            <Plus className="mr-2 size-3.5" />
            Create
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full px-3 text-xs text-destructive hover:bg-destructive/10"
            onClick={() => {
              setClearActionError(null)
              setClearDialogOpen(true)
            }}
            disabled={clearCrmMutation.isPending}
          >
            {clearCrmMutation.isPending ? (
              <Loader2 className="mr-2 size-3.5 animate-spin" />
            ) : (
              <Trash2 className="mr-2 size-3.5" />
            )}
            Clear Data
          </Button>
        </div>
      ) : null}
    </div>
  )

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

              <div className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground">
                  Errors: <span className="font-medium text-destructive">{invalidCountQuery.data ?? 0}</span>
                </div>
                <Link to={diffRoute} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                  To diff
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-3 px-2">
            <div className="flex items-baseline justify-between">
              <h1 className="text-xl font-bold tracking-tight">
                {entity} <span className="ml-1 text-sm font-normal text-muted-foreground">{totalItems} results</span>
              </h1>
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
              <DataTable
                columns={landTableColumns}
                data={landQuery.data?.items ?? []}
                showPaginationControls={false}
                toolbar={tableToolbar}
                sorting={landSorting}
                onSortingChange={handleLandSortingChange}
                columnFilters={landColumnFilters}
                onColumnFiltersChange={handleLandColumnFiltersChange}
              />
            ) : (
              <DataTable
                columns={realtyTableColumns}
                data={realtyQuery.data?.items ?? []}
                showPaginationControls={false}
                toolbar={tableToolbar}
                sorting={realtySorting}
                onSortingChange={handleRealtySortingChange}
                columnFilters={realtyColumnFilters}
                onColumnFiltersChange={handleRealtyColumnFiltersChange}
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
