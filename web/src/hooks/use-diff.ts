import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchApi } from '../shared/api/client'
import type { LandDiffViewDto, PaginatedList, RealtyDiffViewDto } from 'shared'

export function useLandDiffList(page = 1, pageSize = 15) {
  return useQuery({
    queryKey: ['diff', 'land', page, pageSize],
    queryFn: () => fetchApi<PaginatedList<LandDiffViewDto>>(`/diff/land?page=${page}&pageSize=${pageSize}`),
    placeholderData: keepPreviousData,
  })
}

export function useRealtyDiffList(page = 1, pageSize = 15) {
  return useQuery({
    queryKey: ['diff', 'realty', page, pageSize],
    queryFn: () => fetchApi<PaginatedList<RealtyDiffViewDto>>(`/diff/realty?page=${page}&pageSize=${pageSize}`),
    placeholderData: keepPreviousData,
  })
}
