import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { EntityManager } from 'typeorm'

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectEntityManager()
    private readonly em: EntityManager,
  ) {}

  async getAnalytics() {
    const [
      landTotal,
      realtyTotal,
      landArea,
      landValue,
      landOwnershipTypes,
      landPurposeTypes,
      landByYear,
      realtyObjectTypes,
      realtyArea,
      landDiffStats,
      realtyDiffStats,
      landAvgArea,
      landUniqueOwners,
      landAreaDistribution,
      landTopRegistrators,
    ] = await Promise.all([
      this.em.query<[{ count: string }]>(`SELECT COUNT(*) as count FROM registry.land`),
      this.em.query<[{ count: string }]>(`SELECT COUNT(*) as count FROM registry.realty`),
      this.em.query<[{ total: string }]>(`SELECT COALESCE(SUM(square), 0) as total FROM registry.land`),
      this.em.query<[{ total: string }]>(`SELECT COALESCE(SUM(estimate_value), 0) as total FROM registry.land`),
      this.em.query<{ type: string; count: string }[]>(
        `SELECT type, COUNT(*) as count FROM registry.land GROUP BY type ORDER BY count DESC`,
      ),
      this.em.query<{ type: string; count: string }[]>(
        `SELECT land_purpose_type as type, COUNT(*) as count FROM registry.land GROUP BY land_purpose_type ORDER BY count DESC LIMIT 8`,
      ),
      this.em.query<{ year: string; count: string }[]>(
        `SELECT EXTRACT(YEAR FROM state_registration_date)::int as year, COUNT(*) as count
         FROM registry.land
         WHERE state_registration_date IS NOT NULL
         GROUP BY year ORDER BY year`,
      ),
      this.em.query<{ type: string; count: string }[]>(
        `SELECT object_type as type, COUNT(*) as count FROM registry.realty GROUP BY object_type ORDER BY count DESC`,
      ),
      this.em.query<[{ total: string }]>(`SELECT COALESCE(SUM(total_area), 0) as total FROM registry.realty`),
      this.em.query<{ status: string; count: string; avg_sim: string }[]>(
        `SELECT diff_status as status, COUNT(*) as count, AVG(similarity_score) as avg_sim
         FROM public.v_land_diff GROUP BY diff_status`,
      ),
      this.em.query<{ status: string; count: string; avg_sim: string }[]>(
        `SELECT diff_status as status, COUNT(*) as count, AVG(similarity_score) as avg_sim
         FROM public.v_realty_diff GROUP BY diff_status`,
      ),
      this.em.query<[{ avg: string }]>(
        `SELECT AVG(square) as avg FROM registry.land WHERE square IS NOT NULL AND square > 0`,
      ),
      this.em.query<[{ count: string }]>(
        `SELECT COUNT(DISTINCT state_tax_id) as count FROM registry.land WHERE state_tax_id IS NOT NULL`,
      ),
      this.em.query<{ range: string; count: string; sort_order: string }[]>(`
        SELECT
          CASE
            WHEN square < 0.1 THEN '< 0.1 га'
            WHEN square < 0.5 THEN '0.1–0.5 га'
            WHEN square < 1   THEN '0.5–1 га'
            WHEN square < 5   THEN '1–5 га'
            WHEN square < 10  THEN '5–10 га'
            ELSE '> 10 га'
          END as range,
          COUNT(*) as count,
          CASE
            WHEN square < 0.1 THEN 1
            WHEN square < 0.5 THEN 2
            WHEN square < 1   THEN 3
            WHEN square < 5   THEN 4
            WHEN square < 10  THEN 5
            ELSE 6
          END as sort_order
        FROM registry.land
        WHERE square IS NOT NULL
        GROUP BY range, sort_order
        ORDER BY sort_order
      `),
      this.em.query<{ registrator: string; count: string }[]>(`
        SELECT registrator, COUNT(*) as count
        FROM registry.land
        WHERE registrator IS NOT NULL AND registrator <> ''
        GROUP BY registrator
        ORDER BY count DESC
        LIMIT 5
      `),
    ])

    const landMatchCount = landDiffStats.find((s) => s.status === 'MATCH')?.count ?? '0'
    const landTotalDiffs = landDiffStats.reduce((acc, s) => acc + parseInt(s.count), 0)
    const realtyMatchCount = realtyDiffStats.find((s) => s.status === 'MATCH')?.count ?? '0'
    const realtyTotalDiffs = realtyDiffStats.reduce((acc, s) => acc + parseInt(s.count), 0)

    const totalMatched = parseInt(landMatchCount) + parseInt(realtyMatchCount)
    const totalDiffs = landTotalDiffs + realtyTotalDiffs
    const integrityScore = totalDiffs > 0 ? Math.round((totalMatched / totalDiffs) * 100) : 100

    const landIssues = landDiffStats.filter((s) => s.status !== 'MATCH').reduce((acc, s) => acc + parseInt(s.count), 0)
    const realtyIssues = realtyDiffStats
      .filter((s) => s.status !== 'MATCH')
      .reduce((acc, s) => acc + parseInt(s.count), 0)

    const landAvgSim =
      landDiffStats.length > 0
        ? landDiffStats.reduce((acc, s) => acc + (parseFloat(s.avg_sim) || 0) * parseInt(s.count), 0) / landTotalDiffs
        : null

    const realtyAvgSim =
      realtyDiffStats.length > 0
        ? realtyDiffStats.reduce((acc, s) => acc + (parseFloat(s.avg_sim) || 0) * parseInt(s.count), 0) /
          realtyTotalDiffs
        : null

    return {
      overview: {
        totalLandRecords: parseInt(landTotal[0].count),
        totalRealtyRecords: parseInt(realtyTotal[0].count),
        totalLandArea: parseFloat(landArea[0].total),
        totalEstimatedValue: parseFloat(landValue[0].total),
        totalRealtyArea: parseFloat(realtyArea[0].total),
        integrityScore,
        totalIssues: landIssues + realtyIssues,
      },
      land: {
        ownershipTypes: landOwnershipTypes.map((r) => ({ type: r.type || 'Unknown', count: parseInt(r.count) })),
        purposeTypes: landPurposeTypes.map((r) => ({ type: r.type || 'Unknown', count: parseInt(r.count) })),
        byYear: landByYear.map((r) => ({ year: parseInt(r.year), count: parseInt(r.count) })),
        avgArea: landAvgArea[0]?.avg ? Math.round(parseFloat(landAvgArea[0].avg) * 100) / 100 : 0,
        uniqueOwners: parseInt(landUniqueOwners[0]?.count ?? '0'),
        areaDistribution: landAreaDistribution.map((r) => ({ range: r.range, count: parseInt(r.count) })),
        topRegistrators: landTopRegistrators.map((r) => ({ name: r.registrator, count: parseInt(r.count) })),
      },
      realty: {
        objectTypes: realtyObjectTypes.map((r) => ({ type: r.type || 'OTHER', count: parseInt(r.count) })),
      },
      diffs: {
        land: {
          total: landTotalDiffs,
          issues: landIssues,
          byStatus: landDiffStats.map((s) => ({ status: s.status, count: parseInt(s.count) })),
          avgSimilarity: landAvgSim !== null ? Math.round(landAvgSim * 100) / 100 : null,
        },
        realty: {
          total: realtyTotalDiffs,
          issues: realtyIssues,
          byStatus: realtyDiffStats.map((s) => ({ status: s.status, count: parseInt(s.count) })),
          avgSimilarity: realtyAvgSim !== null ? Math.round(realtyAvgSim * 100) / 100 : null,
        },
      },
    }
  }
}
