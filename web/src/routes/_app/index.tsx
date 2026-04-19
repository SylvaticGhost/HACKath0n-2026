import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileText,
  Layers,
  Loader2,
  MapPinned,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { useAnalytics } from '@/hooks/use-analytics'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_app/')({
  component: DashboardPage,
})

const PIE_COLORS = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#ec4899']

const DIFF_STATUS_COLORS: Record<string, string> = {
  MATCH: '#22c55e',
  OWNER_MISMATCH: '#ef4444',
  AREA_MISMATCH: '#f59e0b',
  VALUE_MISMATCH: '#f97316',
  ONLY_IN_REGISTRY: '#a855f7',
  ONLY_IN_CRM: '#3b82f6',
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('en-US')
}

function formatArea(ha: number) {
  if (ha >= 1_000_000) return `${(ha / 1_000_000).toFixed(2)}M ha`
  if (ha >= 1_000) return `${(ha / 1_000).toFixed(1)}K ha`
  return `${ha.toFixed(1)} ha`
}

function formatValue(uah: number) {
  if (uah >= 1_000_000_000) return `${(uah / 1_000_000_000).toFixed(1)}B ₴`
  if (uah >= 1_000_000) return `${(uah / 1_000_000).toFixed(1)}M ₴`
  if (uah >= 1_000) return `${(uah / 1_000).toFixed(0)}K ₴`
  return `${uah.toFixed(0)} ₴`
}

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent?: 'default' | 'green' | 'red' | 'amber'
}

function KpiCard({ label, value, sub, icon, accent = 'default' }: KpiCardProps) {
  const accentClass = {
    default: 'text-primary',
    green: 'text-green-500',
    red: 'text-red-500',
    amber: 'text-amber-500',
  }[accent]

  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={cn('opacity-80', accentClass)}>{icon}</span>
      </div>
      <div>
        <p className={cn('text-2xl font-bold tracking-tight', accentClass)}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border bg-card p-5 flex flex-col', className)}>
      <p className="text-sm font-semibold mb-4">{title}</p>
      {children}
    </div>
  )
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="font-medium mb-1">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

const CustomPieTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: { name: string; value: number; payload: { fill: string } }[]
}) => {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md flex items-center gap-2">
      <span className="size-2 rounded-full" style={{ background: p.payload.fill }} />
      <span className="text-muted-foreground">{p.name}:</span>
      <span className="font-medium">{p.value}</span>
    </div>
  )
}

function IntegrityRing({ score }: { score: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex items-center gap-6">
      <div className="relative size-32 shrink-0">
        <svg viewBox="0 0 128 128" className="-rotate-90 size-32">
          <circle cx="64" cy="64" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {score}%
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">integrity</span>
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-green-500" />
          <span className="text-muted-foreground">Matching records</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-500" />
          <span className="text-muted-foreground">Data mismatches</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-red-500" />
          <span className="text-muted-foreground">Missing in one registry</span>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          {score >= 80
            ? 'Registry is in good shape'
            : score >= 50
              ? 'Moderate discrepancies detected'
              : 'Serious inconsistencies found'}
        </p>
      </div>
    </div>
  )
}

function DiffStatusLegend({ items }: { items: { status: string; count: number }[] }) {
  const total = items.reduce((a, b) => a + b.count, 0)
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
        const color = DIFF_STATUS_COLORS[item.status] ?? '#94a3b8'
        return (
          <div key={item.status} className="flex items-center gap-2 text-xs">
            <span className="size-2.5 rounded-sm shrink-0" style={{ background: color }} />
            <span className="text-muted-foreground flex-1 truncate">{item.status.replace(/_/g, ' ')}</span>
            <span className="font-medium tabular-nums">{item.count}</span>
            <span className="text-muted-foreground w-8 text-right tabular-nums">{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading analytics...</p>
    </div>
  )
}

type Tab = 'land' | 'realty'

function DashboardPage() {
  const { data, isLoading, error } = useAnalytics()
  const [tab, setTab] = useState<Tab>('land')

  if (isLoading) return <LoadingSkeleton />
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20">
        <ShieldAlert className="size-8 text-red-500" />
        <p className="text-sm text-muted-foreground">Failed to load analytics</p>
      </div>
    )
  }

  const { overview, land, realty, diffs } = data

  const totalRecords = overview.totalLandRecords + overview.totalRealtyRecords
  const integrityAccent = overview.integrityScore >= 80 ? 'green' : overview.integrityScore >= 50 ? 'amber' : 'red'

  const ownershipLabels: Record<string, string> = {
    OWNERSHIP: 'Ownership',
    LEASE: 'Lease',
    USAGE: 'Usage',
  }

  const landOwnershipData = land.ownershipTypes.map((t) => ({
    ...t,
    type: ownershipLabels[t.type] ?? t.type,
  }))

  const realtyObjectData = realty.objectTypes.map((t) => ({ ...t, label: t.type }))

  const mergedDiffByStatus = Object.values(
    [...diffs.land.byStatus, ...diffs.realty.byStatus].reduce<Record<string, { status: string; count: number }>>(
      (acc, s) => {
        if (!acc[s.status]) acc[s.status] = { status: s.status, count: 0 }
        acc[s.status].count += s.count
        return acc
      },
      {},
    ),
  ).sort((a, b) => b.count - a.count)

  const avgSimilarity =
    diffs.land.avgSimilarity !== null && diffs.realty.avgSimilarity !== null
      ? Math.round((diffs.land.avgSimilarity + diffs.realty.avgSimilarity) / 2)
      : diffs.land.avgSimilarity !== null
        ? Math.round(diffs.land.avgSimilarity)
        : diffs.realty.avgSimilarity !== null
          ? Math.round(diffs.realty.avgSimilarity)
          : null

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Registry Analytics</h1>
          <p className="text-sm text-muted-foreground">Overview of land and property registry status</p>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label="Total records"
          value={formatNumber(totalRecords)}
          sub={`${formatNumber(overview.totalLandRecords)} land · ${formatNumber(overview.totalRealtyRecords)} realty`}
          icon={<FileText className="size-5" />}
        />
        <KpiCard
          label="Registry integrity"
          value={`${overview.integrityScore}%`}
          sub={overview.totalIssues > 0 ? `${overview.totalIssues} discrepancies` : 'All records match'}
          icon={<CheckCircle2 className="size-5" />}
          accent={integrityAccent}
        />
        <KpiCard
          label="Total land area"
          value={formatArea(overview.totalLandArea)}
          sub="Combined area of all parcels"
          icon={<MapPinned className="size-5" />}
        />
        <KpiCard
          label="Estimated value"
          value={formatValue(overview.totalEstimatedValue)}
          sub="Sum of assessed values"
          icon={<Building2 className="size-5" />}
          accent={overview.totalEstimatedValue > 0 ? 'default' : 'amber'}
        />
      </div>

      {/* Integrity + Diff — always visible */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Registry integrity status">
          <IntegrityRing score={overview.integrityScore} />
        </ChartCard>

        <ChartCard title="Discrepancies by type">
          {mergedDiffByStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data</p>
          ) : (
            <DiffStatusLegend items={mergedDiffByStatus} />
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
            <div className="text-center">
              <p className="text-lg font-bold">{diffs.land.issues + diffs.realty.issues}</p>
              <p className="text-xs text-muted-foreground">Total issues</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{avgSimilarity !== null ? `${avgSimilarity}%` : '—'}</p>
              <p className="text-xs text-muted-foreground">Record similarity</p>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 rounded-xl border bg-muted/40 p-1 w-fit">
        <button
          onClick={() => setTab('land')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            tab === 'land' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <MapPinned className="size-4" />
          Land
        </button>
        <button
          onClick={() => setTab('realty')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            tab === 'realty'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Building2 className="size-4" />
          Realty
        </button>
      </div>

      {/* Land tab */}
      {tab === 'land' && (
        <div className="space-y-4">
          {/* Land KPI */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard
              label="Land records"
              value={formatNumber(overview.totalLandRecords)}
              sub="Total number of parcels"
              icon={<MapPinned className="size-5" />}
            />
            <KpiCard
              label="Avg. parcel area"
              value={formatArea(land.avgArea)}
              sub="Mean value across registry"
              icon={<Layers className="size-5" />}
            />
            <KpiCard
              label="Unique owners"
              value={formatNumber(land.uniqueOwners)}
              sub="By taxpayer ID"
              icon={<Users className="size-5" />}
            />
            <KpiCard
              label="Value per hectare"
              value={
                overview.totalLandArea > 0 ? formatValue(overview.totalEstimatedValue / overview.totalLandArea) : '—'
              }
              sub="Avg. assessed value"
              icon={<Building2 className="size-5" />}
              accent={overview.totalEstimatedValue > 0 ? 'default' : 'amber'}
            />
          </div>

          {/* Registration trend + Ownership types */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Parcel registrations by year" className="lg:col-span-2">
              {land.byYear.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={land.byYear}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      width={35}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Parcels"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#areaGrad)"
                      dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Land ownership type" className="lg:col-span-1">
              {landOwnershipData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={landOwnershipData}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={68}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {landOwnershipData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5">
                    {landOwnershipData.map((item, i) => {
                      const total = landOwnershipData.reduce((a, b) => a + b.count, 0)
                      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                      return (
                        <div key={item.type} className="flex items-center gap-2 text-xs">
                          <span
                            className="size-2.5 rounded-sm shrink-0"
                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-muted-foreground flex-1 truncate">{item.type}</span>
                          <span className="font-medium tabular-nums">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </ChartCard>
          </div>

          {/* Purpose types */}
          {land.purposeTypes.length > 0 && (
            <ChartCard title="Land purpose type (top 8)">
              <div className="space-y-2.5">
                {(() => {
                  const max = Math.max(...land.purposeTypes.map((t) => t.count))
                  return land.purposeTypes.map((item, i) => (
                    <div key={item.type} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-muted-foreground leading-snug">{item.type}</span>
                        <span className="font-medium tabular-nums shrink-0">{formatNumber(item.count)}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(item.count / max) * 100}%`,
                            background: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </ChartCard>
          )}

          {/* Area distribution + Top registrars */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Parcel area distribution">
              {land.areaDistribution.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={land.areaDistribution} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="range"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      width={35}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Parcels" radius={[4, 4, 0, 0]}>
                      {land.areaDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Top 5 registrars">
              {land.topRegistrators.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={land.topRegistrators} layout="vertical" barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      width={160}
                      tickFormatter={(v: string) => (v.length > 26 ? v.slice(0, 26) + '…' : v)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Parcels" radius={[0, 4, 4, 0]} fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </div>
      )}

      {/* Realty tab */}
      {tab === 'realty' && (
        <div className="space-y-4">
          {/* Realty KPI */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <KpiCard
              label="Realty records"
              value={formatNumber(overview.totalRealtyRecords)}
              sub="Total number of objects"
              icon={<Building2 className="size-5" />}
            />
            <KpiCard
              label="Total area"
              value={`${formatNumber(Math.round(overview.totalRealtyArea))} m²`}
              sub="Combined area of all objects"
              icon={<Layers className="size-5" />}
            />
            <KpiCard
              label="Avg. object area"
              value={
                overview.totalRealtyRecords > 0
                  ? `${(overview.totalRealtyArea / overview.totalRealtyRecords).toFixed(1)} m²`
                  : '—'
              }
              sub="Mean value across registry"
              icon={<FileText className="size-5" />}
            />
          </div>

          {/* Realty by object type */}
          <ChartCard title="Realty by object type">
            {realtyObjectData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={realtyObjectData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => (v.length > 14 ? v.slice(0, 14) + '…' : v)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                    {realtyObjectData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Realty diff stats */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Realty discrepancies">
              {diffs.realty.byStatus.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data</p>
              ) : (
                <DiffStatusLegend items={[...diffs.realty.byStatus].sort((a, b) => b.count - a.count)} />
              )}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
                <div className="text-center">
                  <p className="text-lg font-bold">{diffs.realty.issues}</p>
                  <p className="text-xs text-muted-foreground">Problematic records</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">
                    {diffs.realty.avgSimilarity !== null ? `${Math.round(diffs.realty.avgSimilarity)}%` : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">Record similarity</p>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Realty breakdown by type">
              {realtyObjectData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={realtyObjectData}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={68}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {realtyObjectData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5">
                    {realtyObjectData.map((item, i) => {
                      const total = realtyObjectData.reduce((a, b) => a + b.count, 0)
                      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                      return (
                        <div key={item.label} className="flex items-center gap-2 text-xs">
                          <span
                            className="size-2.5 rounded-sm shrink-0"
                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-muted-foreground flex-1 truncate">{item.label}</span>
                          <span className="font-medium tabular-nums">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  )
}
