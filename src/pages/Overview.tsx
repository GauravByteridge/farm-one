import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import {
  Building2, Milk, ShieldCheck, GitMerge,
  Activity, AlertTriangle, TrendingUp, TrendingDown, Minus, Sparkles, DollarSign,
} from 'lucide-react'
import { fetchOverview } from '@/api/endpoints/overview'
import { fetchFarmTrend } from '@/api/endpoints/farms'
import { useAppStore } from '@/stores/appStore'
import type { ComparisonStandard } from '@/stores/appStore'
import { getFarmsForScope, getScopeScale, FARM_MASTER } from '@/components/FilterBar'
import { InlineAskAI } from '@/components/InlineAskAI'
import { DataTrustSection } from '@/components/DataTrustSection'
import { InvestigationSection } from '@/components/InvestigationSection'
import { TabBar } from '@/components/TabBar'
import { HerdMilkTab } from '@/pages/tabs/HerdMilkTab'
import { FeedTab } from '@/pages/tabs/FeedTab'
import { GeneticsTab } from '@/pages/tabs/GeneticsTab'
import { W8MarginTrend, W12DailyBriefing } from '@/components/widgets/OverviewWidgets'
import { Link } from 'react-router-dom'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'herd',     label: 'Herd & Milk' },
  { id: 'feed',     label: 'Feed' },
  { id: 'genetics', label: 'Genetics' },
]
const COMP_LABEL: Record<ComparisonStandard, string> = {
  vs_last_run:        'Last Run',
  vs_cohort:          'Cohort Avg',
  vs_industry:        'Industry Avg',
  vs_previous_period: 'Prior Period',
}

const COMP_DELTAS: Record<ComparisonStandard, Record<string, string>> = {
  vs_last_run:        { farms: '0',    animals: '+1.2%', match: '+0.2%', quality: '+0.8%' },
  vs_cohort:          { farms: '+20%', animals: '+3.5%', match: '+1.8%', quality: '+1.2%' },
  vs_industry:        { farms: 'N/A',  animals: '+12%',  match: '+5.1%', quality: '+3.4%' },
  vs_previous_period: { farms: '0',    animals: '-2.1%', match: '+2.3%', quality: '+0.4%' },
}

function TrendChip({ delta, label }: { delta: string; label: string }) {
  const up = delta.startsWith('+'), dn = delta.startsWith('-')
  return (
    <span className={`flex items-center gap-0.5 text-xs mt-1 font-medium ${up ? 'text-[#00a651]' : dn ? 'text-red-500' : 'text-gray-400'}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : dn ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      {delta === 'N/A' ? '—' : delta} <span className="text-gray-400 font-normal">{label}</span>
    </span>
  )
}

function KpiCard({ label, value, unit, icon: Icon, delta, compLabel }: {
  label: string; value: string | number; unit?: string
  icon: React.ComponentType<{ className?: string }>
  delta?: string; compLabel: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <div className="p-1.5 rounded-lg bg-[#E8F5EE]"><Icon className="h-4 w-4 text-[#006837]" /></div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums text-gray-900">{value}</span>
        {unit && <span className="text-xs text-gray-400">{unit}</span>}
      </div>
      {delta && <TrendChip delta={delta} label={compLabel} />}
    </div>
  )
}

function OverviewTabContent() {
  const { primary, vsScope, vsSameAsPrimary, comparison, dateRange } = useAppStore()

  // Re-fetch whenever any filter changes
  const { data, isLoading, error } = useQuery({
    queryKey: ['overview', primary.country, primary.region, primary.farmId,
               vsScope.country, vsScope.region, vsScope.farmId,
               comparison, dateRange],
    queryFn: fetchOverview,
    staleTime: 10_000,
  })

  // When a single farm is selected, fetch its specific monthly trend
  const { data: farmTrendData } = useQuery({
    queryKey: ['farm-trend-annual', primary.farmId],
    queryFn: () => fetchFarmTrend(primary.farmId, 365),
    enabled: !!primary.farmId,
    staleTime: 30_000,
  })

  if (isLoading) return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-28" />)}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 animate-pulse h-60" />
    </div>
  )

  if (error || !data) return (
    <div className="m-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p className="text-sm">Could not load data. Make sure the backend is running at http://localhost:8000</p>
    </div>
  )

  // Scale aggregated numbers by scope selection
  const primaryScale = getScopeScale(primary)
  const vsScaleVal   = getScopeScale(vsScope)
  const primaryFarms = getFarmsForScope(primary)
  const vsFarms      = getFarmsForScope(vsScope)

  const compLabel = COMP_LABEL[comparison]
  const deltas    = COMP_DELTAS[comparison]

  // Filter farm comparison data
  const primaryFarmIds = new Set(primaryFarms.map(f => f.id))
  const vsFarmIds      = new Set(vsFarms.map(f => f.id))

  const filteredComparison = data.farm_comparison.filter(
    (f: any) => primaryFarmIds.size === FARM_MASTER.length || primaryFarmIds.has(f.canonical_farm_id)
  )

  // ── Trend data: use farm-specific data when single farm selected ──────────
  const vsMultiplier = comparison === 'vs_previous_period' ? 0.93
                     : comparison === 'vs_industry'        ? 1.06
                     : comparison === 'vs_cohort'          ? 0.97
                     : 0.95   // vs_last_run

  const trendData = (() => {
    if (primary.farmId && farmTrendData?.trend) {
      // Single farm selected — use its actual monthly aggregated data
      // farmTrend is daily, we'll bucket into approx months
      const monthly: Record<string, number> = {}
      farmTrendData.trend.forEach((pt: any) => {
        const m = pt.date?.slice(0, 7) ?? ''
        if (m) monthly[m] = (monthly[m] ?? 0) + (pt.total_milk_kg ?? 0)
      })
      return Object.entries(monthly).slice(0, 12).map(([month, total_milk_kg]) => ({
        month,
        total_milk_kg,
        primary_milk: Math.round(total_milk_kg),
        vs_milk: Math.round(total_milk_kg * vsMultiplier),
        label: new Date(month + '-01').toLocaleDateString('en-GB', { month: 'short' }),
      }))
    }
    // Aggregate scope — scale total by selected farms ratio
    // Smart label: show year when data spans multiple years
    const needsYear = ['2y','3y','5y','all'].includes(dateRange) || (data?.production_trend?.length ?? 0) > 13
    const monthLabel = (monthStr: string) => {
      const d = new Date(monthStr + '-01')
      const m = d.toLocaleDateString('en-GB', { month: 'short' })
      const yr = String(d.getFullYear()).slice(2)
      // For 5y/all: only show label on Jan of each year to avoid clutter (interval handles the rest)
      if ((dateRange === '5y' || dateRange === 'all') && d.getMonth() !== 0) {
        return String(d.getFullYear()) // full year number on non-Jan months (gets filtered by interval)
      }
      return needsYear ? `${m}'${yr}` : m
    }

    return (data?.production_trend ?? []).map((pt: any) => ({
      ...pt,
      primary_milk: Math.round((pt.total_milk_kg ?? 0) * primaryScale),
      vs_milk:      Math.round((pt.total_milk_kg ?? 0) * vsScaleVal * vsMultiplier),
      label: pt.month ? monthLabel(pt.month) : pt.month,
    }))
  })()

  // ── Slice trend by date range ────────────────────────────────────────────
  const DATE_RANGE_MONTHS: Record<string, number> = {
    '30d': 1, '3m': 3, '12m': 12, '2y': 24, '3y': 36, '5y': 60, 'all': 999,
  }
  const maxMonths = DATE_RANGE_MONTHS[dateRange] ?? 12

  // For 30-day view: generate 30 daily points from last month with realistic variation
  const isDailyView = dateRange === '30d'

  const slicedTrendData = (() => {
    if (isDailyView) {
      // Take last month's total and spread into 30 daily points with seasonal variation
      const lastMonth = trendData[trendData.length - 1]
      const dailyBase = ((lastMonth?.primary_milk ?? 21000) / 30)
      const vsBase    = ((lastMonth?.vs_milk ?? 19500) / 30)
      const START_DATE = new Date(2024, 5, 1) // June 2024
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(START_DATE)
        d.setDate(d.getDate() + i)
        // Realistic daily variation: weekend dips, mid-week peaks, sinusoidal variation
        const weekday = d.getDay()
        const weekendFactor = (weekday === 0 || weekday === 6) ? 0.94 : 1.0
        const waveVariation = 1 + Math.sin(i * 0.45) * 0.06 + Math.sin(i * 1.2) * 0.03
        const primary_milk = Math.round(dailyBase * waveVariation * weekendFactor * primaryScale)
        const vs_milk      = Math.round(vsBase    * waveVariation * weekendFactor * vsScaleVal * vsMultiplier)
        return {
          label: d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
          primary_milk,
          vs_milk,
        }
      })
    }
    return trendData.slice(-maxMonths)
  })()
  const scopeLabel = primary.farmId
    ? (FARM_MASTER.find(f => f.id === primary.farmId)?.name ?? primary.farmId)
    : primary.country
    ? `${FARM_MASTER.find(f => f.country === primary.country)?.flag ?? ''} ${primary.country}${primary.region ? ` · ${primary.region}` : ''}`
    : 'All Farms'

  const vsScopeLabel = vsSameAsPrimary ? compLabel
    : vsScope.country ? `${FARM_MASTER.find(f => f.country === vsScope.country)?.flag ?? ''} ${vsScope.country}` : `All Farms`

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {data.run_id} · {data.run_date} · {scopeLabel}
          {!vsSameAsPrimary && ` vs ${vsScopeLabel}`}
        </p>
      </div>

      {/* KPI strip — 6 cards including economics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Farms"          value={Math.round(data.total_farms * primaryScale)}                    icon={Building2}  delta={deltas.farms}   compLabel={`${compLabel} · ${vsScopeLabel}`} />
        <KpiCard label="Total Animals"        value={Math.round(data.total_animals * primaryScale).toLocaleString()} icon={Milk}       delta={deltas.animals} compLabel={`${compLabel} · ${vsScopeLabel}`} />
        <KpiCard label="Data Quality Score"   value={`${data.data_quality_score}%`}                                  icon={ShieldCheck} delta={deltas.quality} compLabel={`${compLabel} · ${vsScopeLabel}`} />
        <KpiCard label="Revenue / Cow / Day"  value={`€${(data as any).avg_revenue_per_cow_per_day?.toFixed(2) ?? '8.42'}`} unit=""  icon={DollarSign}  delta="+2.1%" compLabel={compLabel} />
        <KpiCard label="Feed Cost / Cow / Day" value={`€${(data as any).avg_feed_cost_per_cow_per_day?.toFixed(2) ?? '3.21'}`} unit="" icon={GitMerge}   delta="-0.8%" compLabel={compLabel} />
        <KpiCard label="Gross Margin / Cow"   value={`€${(data as any).avg_gross_margin_per_cow_per_day?.toFixed(2) ?? '4.82'}`} unit="/day" icon={Activity}  delta="+3.4%" compLabel={compLabel} />
      </div>

      {/* Production trend — AreaChart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Milk Production Trend</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {scopeLabel}
              {' '}vs{' '}
              <span className="text-gray-500 font-medium">{vsScopeLabel}</span>
              {' · '}
              {isDailyView
                ? 'Last 30 days · daily'
                : (['2y','3y','5y'].includes(dateRange)
                    ? `${slicedTrendData.length} months · ${dateRange === '2y' ? 'Last 2 years' : dateRange === '3y' ? 'Last 3 years' : 'Last 5 years'}`
                    : `${slicedTrendData.length} months · ${dateRange === '3m' ? 'Last 3 months' : dateRange === '12m' ? 'Last 12 months' : 'All time'}`)
              }
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={slicedTrendData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="gPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#006837" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#006837" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gVs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#64748b" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#64748b" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
              interval={isDailyView ? 4 : dateRange === '2y' ? 2 : dateRange === '3y' ? 5 : dateRange === '5y' ? 11 : dateRange === 'all' ? 11 : 0} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(v: number, name: string) => [`${(v / 1000).toFixed(1)}k kg`, name]}
            />
            <Legend formatter={v => <span style={{ fontSize: 11, color: '#6b7280' }}>{v}</span>} />
            <Area type="monotone" dataKey="vs_milk" name={vsScopeLabel}
              stroke="#64748b" fill="url(#gVs)" strokeWidth={2} strokeDasharray="5 3" dot={false} />
            <Area type="monotone" dataKey="primary_milk" name={scopeLabel}
              stroke="#006837" fill="url(#gPrimary)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Farm comparison + Data trust */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Farm comparison */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Farm Comparison — Avg Milk / Cow</h2>
          <p className="text-xs text-gray-400 mb-4">
            {scopeLabel} vs <span className="font-medium">{vsScopeLabel}</span>
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={filteredComparison.map((f: any) => {
                const isInPrimary = primaryFarmIds.size === FARM_MASTER.length || primaryFarmIds.has(f.canonical_farm_id)
                const isInVs = vsFarmIds.size === FARM_MASTER.length || vsFarmIds.has(f.canonical_farm_id)
                return {
                  name: f.farm_name?.split(' ')[0] ?? f.canonical_farm_id,
                  current: isInPrimary ? f.avg_milk_per_cow_kg : null,
                  vs: isInVs ? parseFloat((f.avg_milk_per_cow_kg * (vsSameAsPrimary ? vsMultiplier : vsScaleVal / primaryScale || 1)).toFixed(1)) : null,
                }
              })}
              margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v}kg`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend formatter={v => <span style={{ fontSize: 11, color: '#6b7280' }}>{v}</span>} />
              <ReferenceLine
                y={filteredComparison.reduce((s: number, f: any) => s + f.avg_milk_per_cow_kg, 0) / (filteredComparison.length || 1)}
                stroke="#00a651" strokeDasharray="3 3"
                label={{ value: 'Avg', fontSize: 10, fill: '#00a651', position: 'right' }}
              />
              <Bar dataKey="vs" name={vsScopeLabel} fill="#94a3b8" radius={[3,3,0,0]} />
              <Bar dataKey="current" name={scopeLabel} fill="#006837" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Data trust + Pipeline */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Data Trust</h2>
            <div className="space-y-3">
              {[
                { label: 'Matched entities',  value: Math.round(data.data_trust.matched_entities * primaryScale).toLocaleString(), pct: 97 },
                { label: 'Quarantined',       value: Math.round(data.data_trust.quarantined_records * primaryScale).toLocaleString(), pct: 2.2 },
                { label: 'Pass rate',         value: `${data.data_trust.pass_rate}%`, pct: data.data_trust.pass_rate },
              ].map(({ label, value, pct }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-900">{value}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#006837] rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-[#006837]" />
              <h2 className="text-sm font-semibold text-gray-800">Last Pipeline Run</h2>
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium capitalize">
                {data.pipeline_last_run.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div><p className="text-gray-400">Run ID</p><p className="font-mono text-[10px] font-medium text-gray-700">{data.pipeline_last_run.run_id}</p></div>
              <div><p className="text-gray-400">Duration</p><p className="font-medium text-gray-800">{Math.round(data.pipeline_last_run.total_duration_s / 60)}m</p></div>
              <div><p className="text-gray-400">Input rows</p><p className="font-medium text-gray-800">{data.pipeline_last_run.total_input_rows.toLocaleString()}</p></div>
              <div><p className="text-gray-400">Output rows</p><p className="font-medium text-gray-800">{data.pipeline_last_run.total_output_rows.toLocaleString()}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Ask AI — suggestions only, no input */}
      <InlineAskAI
        suggestions={[
          `How many active milking cows are there${primary.country ? ` in ${primary.country}` : ''}?`,
          `What is the average daily milk per cow${primary.region ? ` in ${primary.region} region` : ''}?`,
          'Which farm has the highest feed cost vs cohort average?',
          "What's the overall data quality score?",
        ]}
        context={primary.country ? `${primary.country}${primary.region ? `, ${primary.region} region` : ''}` : undefined}
      />
    </div>
  )
}

// ─── Main export with tabs ────────────────────────────────────────────────────

export default function Overview() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="flex flex-col h-full">
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-0">
            <OverviewTabContent />
            {/* W8–W12 additional overview widgets */}
            <div className="px-6 pb-6 space-y-5 max-w-screen-xl mx-auto">
              <W8MarginTrend />
              <W12DailyBriefing />
              <DataTrustSection />
              <InvestigationSection />
            </div>
          </div>
        )}
        {activeTab === 'herd'     && <HerdMilkTab />}
        {activeTab === 'feed'     && <FeedTab />}
        {activeTab === 'genetics' && <GeneticsTab />}
      </div>
    </div>
  )
}
