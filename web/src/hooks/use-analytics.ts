import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '../shared/api/client'

export interface AnalyticsData {
  overview: {
    totalLandRecords: number
    totalRealtyRecords: number
    totalLandArea: number
    totalEstimatedValue: number
    totalRealtyArea: number
    integrityScore: number
    totalIssues: number
  }
  land: {
    ownershipTypes: { type: string; count: number }[]
    purposeTypes: { type: string; count: number }[]
    byYear: { year: number; count: number }[]
    avgArea: number
    uniqueOwners: number
    areaDistribution: { range: string; count: number }[]
    topRegistrators: { name: string; count: number }[]
  }
  realty: {
    objectTypes: { type: string; count: number }[]
  }
  diffs: {
    land: {
      total: number
      issues: number
      byStatus: { status: string; count: number }[]
      avgSimilarity: number | null
    }
    realty: {
      total: number
      issues: number
      byStatus: { status: string; count: number }[]
      avgSimilarity: number | null
    }
  }
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => fetchApi<AnalyticsData>('/analytics'),
    staleTime: 30_000,
  })
}
