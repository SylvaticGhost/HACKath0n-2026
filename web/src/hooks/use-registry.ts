import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '../shared/api/client'
import type { LandRegistryDto, PaginatedList, RealtyRegistryDto } from 'shared'

export function useLandRegistryList(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ['registry', 'land', page, pageSize],
    queryFn: () => fetchApi<PaginatedList<LandRegistryDto>>(`/registry/land?page=${page}&pageSize=${pageSize}`),
  })
}

export function useRealtyRegistryList(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ['registry', 'realty', page, pageSize],
    queryFn: () => fetchApi<PaginatedList<RealtyRegistryDto>>(`/registry/realty?page=${page}&pageSize=${pageSize}`),
  })
}
