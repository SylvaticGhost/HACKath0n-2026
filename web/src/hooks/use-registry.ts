import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchApi } from '../shared/api/client'
import type { LandRegistryDto, PaginatedList, RealtyRegistryDto } from 'shared'

interface UseRegistryListOptions {
  enabled?: boolean
}

export function useLandRegistryList(page = 1, pageSize = 10, options?: UseRegistryListOptions) {
  return useQuery({
    queryKey: ['registry', 'land', page, pageSize],
    queryFn: () => fetchApi<PaginatedList<LandRegistryDto>>(`/registry/land?page=${page}&pageSize=${pageSize}`),
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  })
}

export function useRealtyRegistryList(page = 1, pageSize = 10, options?: UseRegistryListOptions) {
  return useQuery({
    queryKey: ['registry', 'realty', page, pageSize],
    queryFn: () => fetchApi<PaginatedList<RealtyRegistryDto>>(`/registry/realty?page=${page}&pageSize=${pageSize}`),
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  })
}
