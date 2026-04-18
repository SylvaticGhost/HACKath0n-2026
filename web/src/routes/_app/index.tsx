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
  Loader2,
  MapPinned,
  ShieldAlert,
  TrendingUp,
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
  return n.toLocaleString('uk-UA')
}

function formatArea(ha: number) {
  if (ha >= 1_000_000) return `${(ha / 1_000_000).toFixed(2)}M га`
  if (ha >= 1_000) return `${(ha / 1_000).toFixed(1)}K га`
  return `${ha.toFixed(1)} га`
}

function formatValue(uah: number) {
  if (uah >= 1_000_000_000) return `${(uah / 1_000_000_000).toFixed(1)} млрд ₴`
  if (uah >= 1_000_000) return `${(uah / 1_000_000).toFixed(1)} млн ₴`
  if (uah >= 1_000) return `${(uah / 1_000).toFixed(0)} тис ₴`
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
          <span className="text-muted-foreground">Збіги в реєстрах</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-500" />
          <span className="text-muted-foreground">Розбіжності даних</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-red-500" />
          <span className="text-muted-foreground">Відсутні в одному реєстрі</span>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          {score >= 80
            ? 'Реєстр у доброму стані'
            : score >= 50
              ? 'Виявлено помірні розбіжності'
              : 'Знайдено серйозні невідповідності'}
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
      <p className="text-sm text-muted-foreground">Завантаження аналітики...</p>
    </div>
  )
}

function DashboardPage() {
  const { data, isLoading, error } = useAnalytics()

  if (isLoading) return <LoadingSkeleton />
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20">
        <ShieldAlert className="size-8 text-red-500" />
        <p className="text-sm text-muted-foreground">Не вдалося завантажити аналітику</p>
      </div>
    )
  }

  const { overview, land, realty, diffs } = data

  const totalRecords = overview.totalLandRecords + overview.totalRealtyRecords
  const integrityAccent = overview.integrityScore >= 80 ? 'green' : overview.integrityScore >= 50 ? 'amber' : 'red'

  const purposeLabels: Record<string, string> = {
    OWNERSHIP: 'Власність',
    LEASE: 'Оренда',
    USAGE: 'Користування',
  }

  const landOwnershipData = land.ownershipTypes.map((t) => ({
    ...t,
    type: purposeLabels[t.type] ?? t.type,
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
      ? Math.round(((diffs.land.avgSimilarity + diffs.realty.avgSimilarity) / 2) * 100)
      : diffs.land.avgSimilarity !== null
        ? Math.round(diffs.land.avgSimilarity * 100)
        : diffs.realty.avgSimilarity !== null
          ? Math.round(diffs.realty.avgSimilarity * 100)
          : null

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Аналітика реєстру</h1>
          <p className="text-sm text-muted-foreground">Огляд стану земельного та майнового реєстру ОТГ</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
          <TrendingUp className="size-3.5" />
          Дані в реальному часі
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label="Всього записів"
          value={formatNumber(totalRecords)}
          sub={`${formatNumber(overview.totalLandRecords)} земля · ${formatNumber(overview.totalRealtyRecords)} нерухомість`}
          icon={<FileText className="size-5" />}
        />
        <KpiCard
          label="Цілісність реєстру"
          value={`${overview.integrityScore}%`}
          sub={overview.totalIssues > 0 ? `${overview.totalIssues} розбіжностей` : 'Всі записи збігаються'}
          icon={<CheckCircle2 className="size-5" />}
          accent={integrityAccent}
        />
        <KpiCard
          label="Площа землі"
          value={formatArea(overview.totalLandArea)}
          sub="Сумарна площа ділянок"
          icon={<MapPinned className="size-5" />}
        />
        <KpiCard
          label="Оціночна вартість"
          value={formatValue(overview.totalEstimatedValue)}
          sub="Сума оціночних вартостей"
          icon={<Building2 className="size-5" />}
          accent={overview.totalEstimatedValue > 0 ? 'default' : 'amber'}
        />
      </div>

      {/* Row 2: Integrity + Diff + Realty types */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Стан цілісності реєстру" className="lg:col-span-1">
          <IntegrityRing score={overview.integrityScore} />
        </ChartCard>

        <ChartCard title="Розбіжності за типом" className="lg:col-span-1">
          {mergedDiffByStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground">Немає даних</p>
          ) : (
            <DiffStatusLegend items={mergedDiffByStatus} />
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
            <div className="text-center">
              <p className="text-lg font-bold">{diffs.land.issues + diffs.realty.issues}</p>
              <p className="text-xs text-muted-foreground">Всього проблем</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{avgSimilarity !== null ? `${avgSimilarity}%` : '—'}</p>
              <p className="text-xs text-muted-foreground">Схожість записів</p>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Нерухомість за типом" className="lg:col-span-1">
          {realtyObjectData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Немає даних</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={realtyObjectData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Кількість" radius={[4, 4, 0, 0]}>
                  {realtyObjectData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Row 3: Year trend + Ownership pie */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Реєстрація ділянок по роках" className="lg:col-span-2">
          {land.byYear.length === 0 ? (
            <p className="text-sm text-muted-foreground">Немає даних</p>
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
                  name="Ділянок"
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

        <ChartCard title="Тип права на землю" className="lg:col-span-1">
          {landOwnershipData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Немає даних</p>
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

      {/* Row 4: Land purpose types */}
      {land.purposeTypes.length > 0 && (
        <ChartCard title="Цільове призначення землі (топ 8)">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={land.purposeTypes} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="type"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={170}
                tickFormatter={(v: string) => (v.length > 28 ? v.slice(0, 28) + '…' : v)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Ділянок" radius={[0, 4, 4, 0]} fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  )
}
