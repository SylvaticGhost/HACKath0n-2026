import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { fetchApi, fetchApiBlob } from '../shared/api/client'
import type {
  LandCrmDto,
  LandRegistryDto,
  LandSearchDto,
  PaginatedList,
  RealtyCrmDto,
  RealtyRegistryDto,
  RealtySearchDto,
  UpdateLandCrmDto,
  UpdateRealtyCrmDto,
} from 'shared'

export type RegistryScope = 'Global Registry' | 'Local Registry'
export type RegistryEntity = 'Land' | 'Realty'

const LOCAL_REGISTRY_QUERY_KEY = ['registry', 'Local Registry'] as const

interface UseRegistryListOptions {
  scope: RegistryScope
  enabled?: boolean
}

function resolveApiBase(scope: RegistryScope) {
  return scope === 'Global Registry' ? '/registry' : '/crm'
}

function buildRealtyRecordPath(stateTaxId: string, ownershipRegistrationDate: string) {
  return `/crm/realty/${encodeURIComponent(stateTaxId)}/${encodeURIComponent(ownershipRegistrationDate)}`
}

function buildQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      continue
    }

    searchParams.set(key, String(value))
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

function buildListPath(
  basePath: string,
  page: number,
  pageSize: number,
  filters?: Record<string, string | number | undefined>,
) {
  return `${basePath}${buildQueryString({
    ...(filters ?? {}),
    page,
    pageSize,
  })}`
}

interface UseLandRegistryListOptions extends UseRegistryListOptions {
  filters?: LandSearchDto
}

interface UseRealtyRegistryListOptions extends UseRegistryListOptions {
  filters?: RealtySearchDto
}

export function useLandRegistryList(page = 1, pageSize = 10, options: UseLandRegistryListOptions) {
  const apiBase = resolveApiBase(options.scope)
  const filters = options.filters ?? {}
  const filtersKey = JSON.stringify(filters)

  return useQuery({
    queryKey: ['registry', options.scope, 'land', page, pageSize, filtersKey],
    queryFn: () => fetchApi<PaginatedList<LandRegistryDto>>(buildListPath(`${apiBase}/land`, page, pageSize, filters)),
    placeholderData: keepPreviousData,
    enabled: options.enabled,
  })
}

export function useRealtyRegistryList(page = 1, pageSize = 10, options: UseRealtyRegistryListOptions) {
  const apiBase = resolveApiBase(options.scope)
  const filters = options.filters ?? {}
  const filtersKey = JSON.stringify(filters)

  return useQuery({
    queryKey: ['registry', options.scope, 'realty', page, pageSize, filtersKey],
    queryFn: () =>
      fetchApi<PaginatedList<RealtyRegistryDto>>(buildListPath(`${apiBase}/realty`, page, pageSize, filters)),
    placeholderData: keepPreviousData,
    enabled: options.enabled,
  })
}

interface UseRegistryLocationSuggestionsOptions {
  enabled?: boolean
  limit?: number
}

export function useRegistryLocationSuggestions(
  scope: RegistryScope,
  entity: RegistryEntity,
  query: string,
  options?: UseRegistryLocationSuggestionsOptions,
) {
  const apiBase = resolveApiBase(scope)
  const limit = options?.limit ?? 8
  const normalizedQuery = query.trim()

  return useQuery({
    queryKey: ['registry', scope, entity, 'location-suggestions', normalizedQuery, limit],
    queryFn: async () => {
      const entityPath = entity === 'Land' ? 'land' : 'realty'
      const url = `${apiBase}/${entityPath}/location-suggestions?query=${encodeURIComponent(normalizedQuery)}&limit=${limit}`

      if (entity === 'Land') {
        const suggestions = await fetchApi<LandRegistryDto[]>(url)
        return Array.from(new Set(suggestions.map((item) => item.location))).slice(0, limit)
      }

      const suggestions = await fetchApi<RealtyRegistryDto[]>(url)
      return Array.from(new Set(suggestions.map((item) => item.objectAddress))).slice(0, limit)
    },
    enabled: (options?.enabled ?? true) && normalizedQuery.length >= 3,
    staleTime: 30_000,
  })
}

export function useRegistryInvalidCount(scope: RegistryScope, entity: RegistryEntity) {
  const apiBase = resolveApiBase(scope)
  const entityPath = entity === 'Land' ? 'land' : 'realty'

  return useQuery({
    queryKey: ['registry', scope, entity, 'invalid-count'],
    queryFn: () => fetchApi<number>(`${apiBase}/${entityPath}/invalid-count`),
    staleTime: 30_000,
  })
}

interface UseRegistryRecordOptions {
  enabled?: boolean
}

export function useLandCrmRecord(cadastralNumber: string | null, options?: UseRegistryRecordOptions) {
  return useQuery({
    queryKey: ['crm', 'land', cadastralNumber],
    queryFn: () => fetchApi<LandCrmDto>(`/crm/land/${encodeURIComponent(cadastralNumber ?? '')}`),
    enabled: Boolean(cadastralNumber) && (options?.enabled ?? true),
  })
}

interface RealtyRecordKey {
  stateTaxId: string
  ownershipRegistrationDate: string
}

export function useRealtyCrmRecord(recordKey: RealtyRecordKey | null, options?: UseRegistryRecordOptions) {
  return useQuery({
    queryKey: ['crm', 'realty', recordKey?.stateTaxId, recordKey?.ownershipRegistrationDate],
    queryFn: () =>
      fetchApi<RealtyCrmDto>(
        buildRealtyRecordPath(recordKey?.stateTaxId ?? '', recordKey?.ownershipRegistrationDate ?? ''),
      ),
    enabled: Boolean(recordKey?.stateTaxId && recordKey?.ownershipRegistrationDate) && (options?.enabled ?? true),
  })
}

async function invalidateLocalRegistryQueries(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: LOCAL_REGISTRY_QUERY_KEY })
}

export function useCreateLandCrmRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: LandCrmDto) =>
      fetchApi<LandCrmDto>('/crm/land', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    onSuccess: async () => {
      await invalidateLocalRegistryQueries(queryClient)
    },
  })
}

interface UpdateLandCrmRecordParams {
  cadastralNumber: string
  dto: UpdateLandCrmDto
}

export function useUpdateLandCrmRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cadastralNumber, dto }: UpdateLandCrmRecordParams) =>
      fetchApi<LandCrmDto>(`/crm/land/${encodeURIComponent(cadastralNumber)}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      }),
    onSuccess: async () => {
      await invalidateLocalRegistryQueries(queryClient)
    },
  })
}

export function useDeleteLandCrmRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cadastralNumber: string) =>
      fetchApi<null>(`/crm/land/${encodeURIComponent(cadastralNumber)}`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      await invalidateLocalRegistryQueries(queryClient)
    },
  })
}

export function useCreateRealtyCrmRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: RealtyCrmDto) =>
      fetchApi<RealtyCrmDto>('/crm/realty', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    onSuccess: async () => {
      await invalidateLocalRegistryQueries(queryClient)
    },
  })
}

interface UpdateRealtyCrmRecordParams extends RealtyRecordKey {
  dto: UpdateRealtyCrmDto
}

export function useUpdateRealtyCrmRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ stateTaxId, ownershipRegistrationDate, dto }: UpdateRealtyCrmRecordParams) =>
      fetchApi<RealtyCrmDto>(buildRealtyRecordPath(stateTaxId, ownershipRegistrationDate), {
        method: 'PUT',
        body: JSON.stringify(dto),
      }),
    onSuccess: async () => {
      await invalidateLocalRegistryQueries(queryClient)
    },
  })
}

export function useDeleteRealtyCrmRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ stateTaxId, ownershipRegistrationDate }: RealtyRecordKey) =>
      fetchApi<null>(buildRealtyRecordPath(stateTaxId, ownershipRegistrationDate), {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      await invalidateLocalRegistryQueries(queryClient)
    },
  })
}

export function useClearCrmData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      fetchApi<null>('/crm/data', {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      await invalidateLocalRegistryQueries(queryClient)
    },
  })
}

type RegistryExportParams =
  | { entity: 'Land'; filters?: LandSearchDto }
  | { entity: 'Realty'; filters?: RealtySearchDto }

export function useExportRegistry() {
  return useMutation({
    mutationFn: ({ entity, filters }: RegistryExportParams) => {
      const path = entity === 'Land' ? '/crm/land/export' : '/crm/realty/export'
      return fetchApiBlob(path + buildQueryString((filters ?? {}) as Record<string, string | number | undefined>))
    },
  })
}
