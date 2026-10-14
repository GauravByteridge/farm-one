import { useState } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { TrendingDown, TrendingUp, Minus, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'

// ─── Filter-reactive mock data ──────────────────────────────────────────────

// Per-farm baselines for herd metrics
const FARM_HERD_BASELINES: Record<string, { pen1: number; pen2: number; pen3: number; sccMultiplier: number }> = {
  'FARM-00101': { pen1: 28.2, pen2: 24.1, pen3: 31.4, sccMultiplier: 1.0 },
  'FARM-00142': { pen1: 26.8, pen2: 22.4, pen3: 29.1, sccMultiplier: 1.15 },
  'FARM-00203': { pen1: 21.4, pen2: 19.8, pen3: 23.2, sccMultiplier: 1.45 },
  'FARM-00267': { pen1: 30.8, pen2: 27.2, pen3: 33.1, sccMultiplier: 0.82 },
  'FARM-00312': { pen1: 27.6, pen2: 23.8, pen3: 30.2, sccMultiplier: 1.08 },
}
const DEFAULT_BASELINE = { pen1: 28.2, pen2: 24.1, pen3: 31.4, sccMultiplier: 1.0 }

function getDatePoints(dateRange: string) {
  const map: Record<string, number> = { '30d': 30, '3m': 13, '12m': 30, '2y': 24, '3y': 36, '5y': 52, 'all': 52 }
  return map[dateRange] ?? 30
}

function getXLabel(dateRange: string, i: number, total: number) {
  if (dateRange === '30d') return `May ${17 + i}`
  if (dateRange === '3m') return `W${i + 1}`
  if (dateRange === '12m') return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan'][i % 13]
  if (dateRange === '2y' || dateRange === '3y') return `M${i + 1}`
  return `W${i + 1}`
}

const LACTATION_CURVE = Array.from({ length: 31 }, (_, i) => {
  const dim = i * 10
  const expected = dim < 60 ? 28 + (dim / 60) * 8 : 36 - ((dim - 60) / 245) * 18
  return {
    dim,
    expected: parseFloat(expected.toFixed(1)),
    actual: parseFloat((expected * (0.95 + Math.sin(i * 0.4) * 0.04) + (Math.random() - 0.5) * 1.2).toFixed(1)),
    band_low: parseFloat((expected * 0.92).toFixed(1)),
    band_high: parseFloat((expected * 1.08).toFixed(1)),
  }
})

const SCC_BANDS = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  lt100: 55 - (i > 4 && i < 8 ? 10 : 0) + (Math.random() - 0.5) * 3,
  band100_200: 25 + (i > 4 && i < 8 ? 4 : 0) + (Math.random() - 0.5) * 2,
  band200_400: 14 + (i > 4 && i < 8 ? 4 : 0) + (Math.random() - 0.5) * 1.5,
  gt400: 6 + (i > 4 && i < 8 ? 2 : 0) + (Math.random() - 0.5) * 1,
}))

const HEALTH_EVENTS = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  mastitis: i === 4 || i === 5 ? 8 + Math.round(Math.random() * 3) : 2 + Math.round(Math.random() * 2),
  lameness: 1 + Math.round(Math.random() * 2),
  respiratory: Math.round(Math.random() * 2),
  other: 1 + Math.round(Math.random()),
  scc: 180 + (i > 3 && i < 7 ? 60 : 0) + (Math.random() - 0.5) * 20,
}))

const COWS = [
  { id: 'C-1042', pen: 'Pen 2', dim: 87, yieldChange: -8.2, sccTrend: 'up', anomaly: 88, tag: 'Watch' },
  { id: 'C-0831', pen: 'Pen 1', dim: 142, yieldChange: +2.1, sccTrend: 'down', anomaly: 12, tag: 'OK' },
  { id: 'C-1187', pen: 'Pen 2', dim: 64, yieldChange: -5.4, sccTrend: 'up', anomaly: 71, tag: 'Watch' },
  { id: 'C-0654', pen: 'Pen 3', dim: 201, yieldChange: -1.2, sccTrend: 'flat', anomaly: 24, tag: 'OK' },
  { id: 'C-0921', pen: 'Pen 1', dim: 37, yieldChange: +4.8, sccTrend: 'down', anomaly: 8, tag: 'OK' },
  { id: 'C-1312', pen: 'Pen 2', dim: 112, yieldChange: -11.3, sccTrend: 'up', anomaly: 94, tag: 'Alert' },
  { id: 'C-0748', pen: 'Pen 3', dim: 178, yieldChange: +0.5, sccTrend: 'flat', anomaly: 15, tag: 'OK' },
  { id: 'C-1055', pen: 'Pen 1', dim: 55, yieldChange: +3.3, sccTrend: 'down', anomaly: 5, tag: 'OK' },
]

const TAG_STYLE: Record<string, string> = {
  Alert: 'bg-rose-100 text-rose-700',
  Watch: 'bg-amber-100 text-amber-700',
  OK:    'bg-green-100 text-[#006837]',
}

function AnomalyBadge({ score }: { score: number }) {
  const color = score > 80 ? 'bg-rose-500' : score > 50 ? 'bg-amber-500' : 'bg-green-500'
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('h-2 w-2 rounded-full', color)} />
      <span className="text-xs tabular-nums">{score}</span>
    </div>
  )
}

export function HerdMilkTab() {
  const [selectedCow, setSelectedCow] = useState<typeof COWS[0] | null>(null)
  const { primary, dateRange } = useAppStore()

  // Re-derive pen trend data from filters
  const baseline = FARM_HERD_BASELINES[primary.farmId] ?? DEFAULT_BASELINE
  const pts = getDatePoints(dateRange)
  const PEN_TREND = Array.from({ length: pts }, (_, i) => ({
    label: getXLabel(dateRange, i, pts),
    pen1: baseline.pen1 + Math.sin(i * 0.3) * 1.5 + Math.sin(i * 0.7) * 0.5,
    pen2: baseline.pen2 + Math.sin(i * 0.4) * 1.2 - (i > pts * 0.6 ? 1.2 : 0) + Math.sin(i * 0.5) * 0.4,
    pen3: baseline.pen3 + Math.sin(i * 0.25) * 2 + Math.sin(i * 0.8) * 0.6,
  }))

  const SCC_BANDS = Array.from({ length: Math.min(pts, 12) }, (_, i) => ({
    label: getXLabel(dateRange, i, 12),
    lt100:     Math.max(0, 55 * (2 - baseline.sccMultiplier) - (i > 4 && i < 8 ? 10 : 0)),
    band100_200: 25 + (baseline.sccMultiplier > 1.2 ? 5 : 0) + (i > 4 && i < 8 ? 4 : 0),
    band200_400: 14 + (baseline.sccMultiplier > 1.2 ? 4 : 0),
    gt400:       Math.round(4 * baseline.sccMultiplier),
  }))

  const scopeLabel = primary.farmId
    ? COWS.length > 0 ? `Farm ${primary.farmId.slice(-3)}` : primary.farmId
    : primary.region || primary.country || 'All Farms'

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">

      {/* + W17 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Production by pen */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Production by Pen</h3>
          <p className="text-xs text-gray-400 mb-3">{scopeLabel} · {dateRange}</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={PEN_TREND} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={Math.floor(pts / 6)} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(0)}kg`} />
              <Tooltip formatter={(v: number, n: string) => [`${v.toFixed(1)} kg`, n.toUpperCase()]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend formatter={v => <span style={{ fontSize: 11 }}>{String(v).toUpperCase()}</span>} />
              <Line dataKey="pen1" stroke="#006837" strokeWidth={2} dot={false} name="Pen 1" />
              <Line dataKey="pen2" stroke="#f59e0b" strokeWidth={2} dot={false} name="Pen 2" />
              <Line dataKey="pen3" stroke="#3b82f6" strokeWidth={2} dot={false} name="Pen 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cow Watchlist */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Cow Watchlist</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="text-left py-1.5 pr-2">Cow</th>
                  <th className="text-left py-1.5 pr-2">Pen</th>
                  <th className="text-left py-1.5 pr-2">DIM</th>
                  <th className="text-left py-1.5 pr-2">7d Yield</th>
                  <th className="text-left py-1.5 pr-2">SCC</th>
                  <th className="text-left py-1.5 pr-2">Anomaly</th>
                  <th className="text-left py-1.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {COWS.map(c => (
                  <tr key={c.id}
                    className="border-b border-gray-50 hover:bg-[#E8F5EE] cursor-pointer transition-colors"
                    onClick={() => setSelectedCow(c)}>
                    <td className="py-2 pr-2 font-mono font-medium text-gray-800">{c.id}</td>
                    <td className="py-2 pr-2 text-gray-600">{c.pen}</td>
                    <td className="py-2 pr-2 tabular-nums">{c.dim}</td>
                    <td className={cn('py-2 pr-2 tabular-nums font-semibold flex items-center gap-0.5',
                      c.yieldChange > 0 ? 'text-[#006837]' : 'text-rose-600')}>
                      {c.yieldChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {c.yieldChange > 0 ? '+' : ''}{c.yieldChange}%
                    </td>
                    <td className="py-2 pr-2">
                      {c.sccTrend === 'up' ? <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
                        : c.sccTrend === 'down' ? <TrendingDown className="h-3.5 w-3.5 text-[#006837]" />
                        : <Minus className="h-3.5 w-3.5 text-gray-400" />}
                    </td>
                    <td className="py-2 pr-2"><AnomalyBadge score={c.anomaly} /></td>
                    <td className="py-2">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', TAG_STYLE[c.tag])}>{c.tag}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lactation Curve */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Lactation Curve Explorer</h3>
          <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
            {COWS.slice(0, 4).map(c => <option key={c.id}>{c.id} ({c.pen})</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={LACTATION_CURVE} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#006837" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#006837" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="dim" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
              label={{ value: 'Days in Milk', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}kg`} />
            <Tooltip formatter={(v: number, n: string) => [`${v.toFixed(1)} kg`, n]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Area dataKey="band_high" fill="url(#bandFill)" stroke="transparent" name="Band high" />
            <Area dataKey="band_low" fill="white" stroke="transparent" name="Band low" />
            <Line dataKey="expected" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Expected" />
            <Line dataKey="actual" stroke="#006837" strokeWidth={2.5} dot={false} name="Actual" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* SCC Bands + W16 Health Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SCC Bands */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">SCC Bands · {dateRange}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={SCC_BANDS} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend formatter={v => <span style={{ fontSize: 10 }}>{v}</span>} />
              <Area dataKey="lt100" stackId="a" fill="#006837" stroke="transparent" name="<100k (healthy)" />
              <Area dataKey="band100_200" stackId="a" fill="#84cc16" stroke="transparent" name="100-200k" />
              <Area dataKey="band200_400" stackId="a" fill="#f59e0b" stroke="transparent" name="200-400k" />
              <Area dataKey="gt400" stackId="a" fill="#ef4444" stroke="transparent" name=">400k" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Health Events */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Health Events Timeline</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={HEALTH_EVENTS} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="events" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="scc" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend formatter={v => <span style={{ fontSize: 10 }}>{v}</span>} />
              <Bar yAxisId="events" dataKey="mastitis" stackId="a" fill="#ef4444" name="Mastitis" />
              <Bar yAxisId="events" dataKey="lameness" stackId="a" fill="#f59e0b" name="Lameness" />
              <Bar yAxisId="events" dataKey="respiratory" stackId="a" fill="#6366f1" name="Respiratory" />
              <Bar yAxisId="events" dataKey="other" stackId="a" fill="#94a3b8" name="Other" radius={[2,2,0,0]} />
              <Line yAxisId="scc" dataKey="scc" stroke="#006837" strokeWidth={2} dot={false} name="SCC" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cow detail slide-out */}
      {selectedCow && (
        <div className="fixed right-0 top-0 bottom-0 w-[380px] bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Cow {selectedCow.id}</h2>
            <button onClick={() => setSelectedCow(null)}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Pen', selectedCow.pen], ['DIM', selectedCow.dim],
                ['7d yield change', `${selectedCow.yieldChange > 0 ? '+' : ''}${selectedCow.yieldChange}%`],
                ['Anomaly score', selectedCow.anomaly],
              ].map(([k, v]) => (
                <div key={String(k)} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#E8F5EE] border border-[#D0EBD9] rounded-xl p-3">
              <p className="text-xs text-[#006837] font-semibold mb-1">AI suggestion</p>
              <p className="text-xs text-gray-700">
                {selectedCow.tag === 'Alert'
                  ? 'Significant yield decline and rising SCC. Recommend veterinary check and milking hygiene review within 24h.'
                  : selectedCow.tag === 'Watch'
                  ? 'Monitor closely. Yield declining — check feed access, pen comfort, and SCC trend daily.'
                  : 'Performing within normal range. No immediate action required.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
