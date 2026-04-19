import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedList, AnomalyDto } from 'shared'
import { fetchApi } from '../shared/api/client'

export function useAnomaliesList(page = 1, pageSize = 10, hideResolved = false) {
  return useQuery({
    queryKey: ['anomalies', page, pageSize, hideResolved],
    queryFn: () =>
      fetchApi<PaginatedList<AnomalyDto>>(
        `/crm/anomaly?page=${page}&pageSize=${pageSize}&hide_resolved=${hideResolved}`,
      ),
  })
}

export function useGenerateAnomalyReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      fetchApi('/crm/anomaly/generate', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomalies'] })
    },
  })
}

export function useResolveAnomaly() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      fetchApi(`/crm/anomaly/${id}/resolve`, {
        method: 'PUT',
      }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['anomalies'] })

      const previousQueries = queryClient.getQueriesData<PaginatedList<AnomalyDto>>({ queryKey: ['anomalies'] })

      queryClient.setQueriesData<PaginatedList<AnomalyDto>>({ queryKey: ['anomalies'] }, (old) => {
        if (!old) return old
        return {
          ...old,
          items: old.items.map((item) => (item.id === id ? { ...item, status: 'RESOLVED' } : item)),
        }
      })

      return { previousQueries }
    },
    onError: (_err, _id, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['anomalies'] })
    },
  })
}
