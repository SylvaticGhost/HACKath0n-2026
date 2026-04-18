import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchApi } from '../shared/api/client'
import type { LandRegistryDto, PaginatedList, RealtyRegistryDto } from 'shared'

export type RegistryScope = 'Global Registry' | 'Local Registry'
export type RegistryEntity = 'Land' | 'Realty'

interface UseRegistryListOptions {
  scope: RegistryScope
  location?: string
  enabled?: boolean
}

function resolveApiBase(scope: RegistryScope) {
  return scope === 'Global Registry' ? '/registry' : '/crm'
}

function buildPath(basePath: string, page: number, pageSize: number, searchParam: string, location?: string) {
  const trimmedLocation = location?.trim()
  if (!trimmedLocation) {
    return `${basePath}?page=${page}&pageSize=${pageSize}`
  }

  return `${basePath}/search?${searchParam}=${encodeURIComponent(trimmedLocation)}&page=${page}&pageSize=${pageSize}`
}

export function useLandRegistryList(page = 1, pageSize = 10, options: UseRegistryListOptions) {
  const apiBase = resolveApiBase(options.scope)
  const location = options.location?.trim() ?? ''

  return useQuery({
    queryKey: ['registry', options.scope, 'land', page, pageSize, location],
    queryFn: () =>
      fetchApi<PaginatedList<LandRegistryDto>>(buildPath(`${apiBase}/land`, page, pageSize, 'location', location)),
    placeholderData: keepPreviousData,
    enabled: options.enabled,
  })
}

export function useRealtyRegistryList(page = 1, pageSize = 10, options: UseRegistryListOptions) {
  const apiBase = resolveApiBase(options.scope)
  const location = options.location?.trim() ?? ''

  return useQuery({
    queryKey: ['registry', options.scope, 'realty', page, pageSize, location],
    queryFn: () =>
      fetchApi<PaginatedList<RealtyRegistryDto>>(
        buildPath(`${apiBase}/realty`, page, pageSize, 'objectAddress', location),
      ),
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
