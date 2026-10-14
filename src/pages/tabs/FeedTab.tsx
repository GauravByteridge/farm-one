import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'

// ─── Per-farm feed baselines ─────────────────────────────────────────────────

const FARM_FEED: Record<string, { base: number; drift: number }> = {
  'FARM-00101': { base: 0.28, drift: 0.008 },
  'FARM-00142': { base: 0.31, drift: 0.012 },
  'FARM-00203': { base: 0.34, drift: 0.015 },
  'FARM-00267': { base: 0.26, drift: 0.006 },
  'FARM-00312': { base: 0.29, drift: 0.010 },
}

function pts(dr: string) {
  return ({ '30d':12,'3m':12,'12m':12,'2y':24,'3y':24,'5y':24,'all':24 } as Record<string,number>)[dr] ?? 12
}

function label(dr: string, i: number) {
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  if (dr === '30d') return `${17 + i * 2} May`
  if (dr === '3m')  return `W${i + 1}`
  if (dr === '12m') return m[i % 12]
  return `M${i + 1}`
}

const INGREDIENTS = ['Corn Silage', 'Hay', 'Concentrate', 'Minerals']
const PRICES = Array.from({ length: 24 }, (_, i) => ({
  label: `${2022 + Math.floor((i + 4) / 12)}-${String(((i + 4) % 12) + 1).padStart(2, '0')}`,
  corn_ref: 42, corn_act: 42 + Math.sin(i * 0.4) * 4 + (i > 16 ? 3 : 0),
  hay_ref: 65, hay_act: 65 + Math.sin(i * 0.3) * 5 - 2,
}))

function DeviationCell({ val }: { val: number }) {
  const abs = Math.abs(val)
  const bg = abs > 5 ? 'bg-rose-100 text-rose-700' : abs > 2 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-[#006837]'
  return (
    <td className={cn('px-2 py-1.5 text-center text-xs font-medium tabular-nums', bg)}>
      {val > 0 ? '+' : ''}{val}%
    </td>
  )
}

export function FeedTab() {
  const { primary, dateRange } = useAppStore()
  const fb = FARM_FEED[primary.farmId] ?? FARM_FEED['FARM-00101']
  const n = pts(dateRange)

  const feedCostData = Array.from({ length: n }, (_, i) => ({
    label: label(dateRange, i),
    pen1: parseFloat((fb.base + Math.sin(i * 0.3) * 0.015).toFixed(3)),
    pen2: parseFloat((fb.base + 0.02 + Math.sin(i * 0.4) * 0.012).toFixed(3)),
    pen4: parseFloat((fb.base + (i >= n * 0.5 ? (i - n * 0.5) * fb.drift : 0) + Math.sin(i * 0.2) * 0.008).toFixed(3)),
    ration: i === Math.floor(n * 0.3) || i === Math.floor(n * 0.65),
  }))

  const dualData = Array.from({ length: Math.min(n, 30) }, (_, i) => ({
    label: label(dateRange, i),
    feed: parseFloat((22 - (i >= n * 0.5 && i <= n * 0.65 ? 2.8 : 0) + Math.sin(i * 0.4) * 0.6).toFixed(1)),
    milk: parseFloat((29 - (i >= n * 0.55 && i <= n * 0.7 ? 2.5 : 0) + Math.sin(i * 0.3) * 1.0).toFixed(1)),
  }))

  const heatmapData = INGREDIENTS.map(ing => ({
    ingredient: ing,
    ...Object.fromEntries(Array.from({ length: n }, (_, i) => {
      const base = ing === 'Corn Silage' && i >= n * 0.5 && i <= n * 0.65 ? 9 + Math.sin(i * 0.5) * 2
                 : ing === 'Hay' && i === Math.floor(n * 0.35) ? 4.5
                 : (Math.sin(i * 0.3 + ing.length) - 0.3) * 4
      return [label(dateRange, i), parseFloat(base.toFixed(1))]
    })),
  }))

  const scaleData = Array.from({ length: Math.min(n, 8) }, (_, i) => ({
    label: label(dateRange, i),
    scale1: parseFloat((Math.sin(i * 0.6) * 2.5).toFixed(1)),
    scale2: parseFloat((6 + Math.sin(i * 0.4) * 2).toFixed(1)),
  }))

  const xLabels = Array.from({ length: n }, (_, i) => label(dateRange, i))

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">

      {/* Feed cost by pen */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Feed Cost / kg Milk by Pen</h3>
            <p className="text-xs text-gray-400">▲ = ration change · {dateRange}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={feedCostData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
              interval={Math.floor(n / 6)} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
              tickFormatter={v => `$${v.toFixed(2)}`} domain={[0.24, 0.40]} />
            <Tooltip formatter={(v: number, name: string) => [`$${(v as number).toFixed(3)}/kg`, name]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend formatter={v => <span style={{ fontSize: 11 }}>{v}</span>} />
            {feedCostData.filter(d => d.ration).map((d, i) => (
              <ReferenceLine key={i} x={d.label} stroke="#006837" strokeDasharray="3 3"
                label={{ value: '▲', fontSize: 12, fill: '#006837' }} />
            ))}
            <Line dataKey="pen1" stroke="#006837" strokeWidth={2} dot={false} name="Pen 1" />
            <Line dataKey="pen2" stroke="#3b82f6" strokeWidth={2} dot={false} name="Pen 2" />
            <Line dataKey="pen4" stroke="#ef4444" strokeWidth={2.5} dot={false} name="Pen 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Target vs Actual + Dual axis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Target vs Actual Heatmap */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Target vs Actual Deviation</h3>
          <p className="text-xs text-gray-400 mb-3">% deviation from ration target · red = over, green = on target</p>
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-1.5 pr-3 text-gray-500">Ingredient</th>
                  {xLabels.slice(0, Math.min(n, 9)).map(l => (
                    <th key={l} className="text-center py-1.5 px-1 text-gray-400 font-normal">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map(row => (
                  <tr key={row.ingredient} className="border-b border-gray-50">
                    <td className="py-1.5 pr-3 font-medium text-gray-700 whitespace-nowrap">{row.ingredient}</td>
                    {xLabels.slice(0, Math.min(n, 9)).map((l, i) => (
                      <DeviationCell key={i} val={row[l as keyof typeof row] as unknown as number ?? 0} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dual axis */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Feed Delivered vs Milk (Pen 4)</h3>
          <p className="text-xs text-gray-400 mb-4">Feed drop precedes milk drop by ~2 periods · {dateRange}</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dualData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                interval={Math.floor(dualData.length / 5)} />
              <YAxis yAxisId="feed" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v.toFixed(0)}kg`} domain={[18, 26]} />
              <YAxis yAxisId="milk" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v.toFixed(0)}kg`} domain={[24, 33]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend formatter={v => <span style={{ fontSize: 11 }}>{v}</span>} />
              <Line yAxisId="feed" dataKey="feed" stroke="#f59e0b" strokeWidth={2} dot={false} name="Feed (kg DM/cow)" />
              <Line yAxisId="milk" dataKey="milk" stroke="#006837" strokeWidth={2} dot={false} name="Milk (kg/cow)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scale view + Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Scale */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Scale & Operator View</h3>
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">12 events excluded</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={scaleData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <ReferenceLine y={3} stroke="#f59e0b" strokeDasharray="3 3" />
              <ReferenceLine y={-3} stroke="#f59e0b" strokeDasharray="3 3" />
              <Bar dataKey="scale1" fill="#006837" radius={[3,3,0,0]} name="Scale 1 %" />
              <Bar dataKey="scale2" fill="#ef4444" radius={[3,3,0,0]} name="Scale 2 %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ingredient Prices */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Ingredient Price Index</h3>
            <div className="relative group ml-auto">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
              <div className="absolute right-0 top-5 w-56 bg-gray-900 text-white text-xs rounded-lg p-2.5 hidden group-hover:block z-10">
                Reference prices are fixed at contract start. Actual prices reflect supplier invoices.
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={PRICES} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={5} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend formatter={v => <span style={{ fontSize: 10 }}>{v}</span>} />
              <Line dataKey="corn_ref" stroke="#006837" strokeWidth={1} strokeDasharray="4 2" dot={false} name="Corn ref" />
              <Line dataKey="corn_act" stroke="#006837" strokeWidth={2} dot={false} name="Corn actual" />
              <Line dataKey="hay_ref" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 2" dot={false} name="Hay ref" />
              <Line dataKey="hay_act" stroke="#3b82f6" strokeWidth={2} dot={false} name="Hay actual" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
