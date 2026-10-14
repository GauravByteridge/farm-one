/**
 * My Farm — Farm Owner / Manager landing (Persona B)
 * Farm picker → KPIs + Economics → 30-day trend → Health events → Needs Attention → Ask AI
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Milk, DollarSign, ShieldCheck, Activity, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { fetchFarmDetail, fetchFarmTrend } from '@/api/endpoints/farms'
import { fetchDqIssues } from '@/api/endpoints/quality'
import { useAppStore } from '@/stores/appStore'

// Farm-specific mock economics (per cow / day)
const FARM_ECONOMICS: Record<string, { revenue: number; feedCost: number; grossMargin: number; netMargin: number; scc: number; healthEvents: number }> = {
  'FARM-00101': { revenue: 8.61, feedCost: 3.12, grossMargin: 5.12, netMargin: 4.12, scc: 142, healthEvents: 3 },
  'FARM-00142': { revenue: 8.21, feedCost: 3.48, grossMargin: 4.61, netMargin: 3.72, scc: 168, healthEvents: 5 },
  'FARM-00203': { revenue: 7.01, feedCost: 3.82, grossMargin: 3.24, netMargin: 2.61, scc: 214, healthEvents: 8 },
  'FARM-00267': { revenue: 8.94, feedCost: 2.98, grossMargin: 5.48, netMargin: 4.41, scc: 98,  healthEvents: 2 },
  'FARM-00312': { revenue: 8.12, feedCost: 3.28, grossMargin: 4.84, netMargin: 3.90, scc: 156, healthEvents: 4 },
}

// 8-week profit/cost breakdown for selected farm
function getFarmWeeklyBreakdown(farmId: string) {
  const eco = FARM_ECONOMICS[farmId] ?? FARM_ECONOMICS['FARM-00101']
  return Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`,
    revenue: parseFloat((eco.revenue * 7 * 380 + Math.sin(i * 0.5) * 120).toFixed(0)),
    feed_cost: parseFloat((eco.feedCost * 7 * 380 + Math.sin(i * 0.3) * 80).toFixed(0)),
    net_margin: parseFloat((eco.netMargin * 7 * 380 + Math.sin(i * 0.4) * 100).toFixed(0)),
  }))
}

const FARMS = [
  { id: 'FARM-00101', name: 'Green Valley Dairy', region: 'North 🇬🇧' },
  { id: 'FARM-00142', name: 'Sunrise Farm',        region: 'North 🇬🇧' },
  { id: 'FARM-00203', name: 'Hillside Ranch',      region: 'South 🇮🇪' },
  { id: 'FARM-00267', name: 'Valley View Farm',    region: 'East 🇳🇱' },
  { id: 'FARM-00312', name: 'Blue Ridge Farm',     region: 'West 🇳🇿' },
]

export default function MyFarm() {
  const [farmId, setFarmId] = useState(FARMS[0].id)

  const { data: farm } = useQuery({ queryKey: ['farm-detail', farmId], queryFn: () => fetchFarmDetail(farmId) })
  const { data: trend } = useQuery({ queryKey: ['farm-trend', farmId], queryFn: () => fetchFarmTrend(farmId, 30) })
  const { data: issues } = useQuery({ queryKey: ['dq-issues'], queryFn: fetchDqIssues })

  const farmIssues = issues?.issues?.slice(0, 4) ?? []
  const farmName = FARMS.find(f => f.id === farmId)?.name ?? 'your farm'
  const eco = FARM_ECONOMICS[farmId] ?? FARM_ECONOMICS['FARM-00101']

  // Generate profit breakdown based on dateRange
  const { primary, dateRange } = useAppStore()
  const PERIOD_PTS: Record<string, number> = { '30d': 8, '3m': 12, '12m': 12, '2y': 24, '3y': 36, '5y': 52, 'all': 52 }
  const pts = PERIOD_PTS[dateRange] ?? 8
  const PERIOD_LABELS: Record<string, (i: number) => string> = {
    '30d':  i => `${17 + i * 3} May`,
    '3m':   i => `W${i + 1}`,
    '12m':  i => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i % 12],
    '2y':   i => `M${i + 1}`,
    '3y':   i => `M${i + 1}`,
    '5y':   i => `Q${Math.floor(i / 3) + 1}'${20 + Math.floor(i / 12)}`,
    'all':  i => `Q${Math.floor(i / 3) + 1}`,
  }
  const getLabel = PERIOD_LABELS[dateRange] ?? ((i: number) => `P${i + 1}`)

  const weeklyBreakdown = Array.from({ length: pts }, (_, i) => {
    const wave = Math.sin(i * 0.4) * 0.08
    const rev  = Math.round(eco.revenue * 7 * 380 * (1 + wave) * (pts <= 12 ? 1 : pts <= 24 ? 0.95 : 0.9))
    const feed = Math.round(eco.feedCost * 7 * 380 * (1 + Math.sin(i * 0.3) * 0.06))
    return {
      label: getLabel(i),
      revenue:    rev,
      feed_cost:  feed,
      net_margin: Math.round((rev - feed) * 0.82),
    }
  })

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Farm</h1>
          <p className="text-sm text-gray-500 mt-0.5">Farm-level operational & financial view</p>
        </div>
        <select
          value={farmId}
          onChange={e => setFarmId(e.target.value)}
          className="ml-auto text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#006837]"
        >
          {FARMS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {/* KPI strip — 6 cards */}
      {farm && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: 'Active Animals',     value: farm.gold_active_animals.toLocaleString(), sub: 'cows',        icon: Activity,    color: 'text-[#006837]' },
            { label: 'Avg Milk/Cow/Day',   value: `${farm.gold_avg_milk_per_cow_kg} kg`,     sub: '',             icon: Milk,        color: 'text-blue-600' },
            { label: 'SCC (k cells/mL)',   value: eco.scc.toLocaleString(),                  sub: eco.scc > 200 ? '⚠ High' : 'Normal', icon: ShieldCheck, color: eco.scc > 200 ? 'text-rose-600' : 'text-[#006837]' },
            { label: 'Revenue/Cow/Day',    value: `€${eco.revenue.toFixed(2)}`,              sub: '/cow',         icon: DollarSign,  color: 'text-[#006837]' },
            { label: 'Feed Cost/Cow/Day',  value: `€${eco.feedCost.toFixed(2)}`,             sub: '/cow',         icon: TrendingDown,color: eco.feedCost > 3.5 ? 'text-rose-600' : 'text-amber-600' },
            { label: 'Net Margin/Cow/Day', value: `€${eco.netMargin.toFixed(2)}`,            sub: '/cow',         icon: TrendingUp,  color: eco.netMargin > 4 ? 'text-[#006837]' : eco.netMargin > 3 ? 'text-amber-600' : 'text-rose-600' },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-500">{label}</p>
                <div className="p-1 rounded-lg bg-[#E8F5EE]"><Icon className="h-3.5 w-3.5 text-[#006837]" /></div>
              </div>
              <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
              {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* 30-day trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Milk Production — Last 30 Days</h2>
            <p className="text-xs text-gray-400 mt-0.5">avg kg/cow/day · current vs prior period</p>
          </div>
        </div>
        {trend ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={trend.trend.map(pt => ({
                ...pt,
                // Simulated prior period: ±8% variation
                prior_period: parseFloat((pt.avg_milk_per_cow_kg * 0.93).toFixed(2)),
                // Format date label: 2024-05-17 → May 17
                label: new Date(pt.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
              }))}
              margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
            >
              <defs>
                <linearGradient id="milkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#006837" stopOpacity={0.12}/>
                  <stop offset="95%" stopColor="#006837" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                interval={Math.floor(pts / 8)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}kg`}
                width={40}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v: number, name: string) => [
                  `${v.toFixed(1)} kg`,
                  name === 'avg_milk_per_cow_kg' ? 'Current period' : 'Prior period',
                ]}
              />
              <Line
                dataKey="prior_period"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                name="prior_period"
              />
              <Line
                dataKey="avg_milk_per_cow_kg"
                stroke="#006837"
                strokeWidth={2.5}
                dot={false}
                name="avg_milk_per_cow_kg"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 bg-gray-50 animate-pulse rounded-lg" />
        )}
      </div>

      {/* 8-week Revenue / Feed Cost / Net Margin */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">Revenue, Feed Cost & Net Margin</h2>
        <p className="text-xs text-gray-400 mb-4">€ · last 8 weeks · {farmName}</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyBreakdown} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
              tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number, n: string) => [`€${v.toLocaleString()}`, n]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend formatter={v => <span style={{ fontSize: 11 }}>{v}</span>} />
            <Bar dataKey="revenue" name="Revenue" fill="#a7c4a0" radius={[3,3,0,0]} />
            <Bar dataKey="feed_cost" name="Feed Cost" fill="#dc2626" radius={[3,3,0,0]} />
            <Bar dataKey="net_margin" name="Net Margin" fill="#1d4ed8" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Needs attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-700">Needs Attention</h2>
            {eco.healthEvents > 0 && (
              <span className="ml-auto text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">
                {eco.healthEvents} health events this week
              </span>
            )}
          </div>
          {farmIssues.length === 0 ? (
            <p className="text-sm text-gray-400">No issues to review.</p>
          ) : (
            <ul className="space-y-2">
              {farmIssues.map(issue => (
                <li key={issue.issue_id} className="flex items-start gap-2 text-xs p-2.5 rounded-lg bg-gray-50">
                  <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    issue.severity === 'error' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                  }`}>{issue.severity}</span>
                  <span className="text-gray-700">{issue.rule_description}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        </div>
    </div>
  )
}
