import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'

const COHORT_TREND = Array.from({ length: 12 }, (_, i) => ({
  month: `M${i + 1}`,
  c2019: 120 + Math.sin(i * 0.3) * 4,
  c2020: 128 + Math.sin(i * 0.35) * 3,
  c2021: 134 + Math.sin(i * 0.4) * 5,
  c2022: 145 + Math.sin(i * 0.3) * 6,
  c2023: 138 + Math.sin(i * 0.45) * 4,
  catalog_avg: 130,
}))

const QUARTILE_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: `M${i + 1}`,
  q1_milk: 32 + Math.sin(i * 0.3) * 1.2, q2_milk: 29 + Math.sin(i * 0.35) * 1,
  q3_milk: 27 + Math.sin(i * 0.4) * 0.8, q4_milk: 24 + Math.sin(i * 0.45) * 1.5,
  q1_scc: 90 + Math.sin(i * 0.25) * 12, q2_scc: 140 + Math.sin(i * 0.3) * 15,
  q3_scc: 195 + Math.sin(i * 0.35) * 20, q4_scc: 280 + Math.sin(i * 0.4) * 35,
  q1_mast: 2 + Math.random(), q2_mast: 4 + Math.random(),
  q3_mast: 7 + Math.random(), q4_mast: 11 + Math.random(),
}))

const SIRES = [
  { name: 'Bull-A442', daughters: 48, scc_avg: 88, scc_trend: 'down', milk: 31.4, conception: 62 },
  { name: 'Bull-B217', daughters: 34, scc_avg: 142, scc_trend: 'flat', milk: 29.8, conception: 58 },
  { name: 'Bull-C891', daughters: 62, scc_avg: 105, scc_trend: 'down', milk: 30.2, conception: 64 },
  { name: 'Bull-D334', daughters: 27, scc_avg: 198, scc_trend: 'up', milk: 28.6, conception: 55 },
  { name: 'Bull-E705', daughters: 41, scc_avg: 123, scc_trend: 'flat', milk: 32.1, conception: 61 },
  { name: 'Bull-F189', daughters: 19, scc_avg: 91, scc_trend: 'down', milk: 33.2, conception: 68 },
]

const BREEDING = Array.from({ length: 12 }, (_, i) => ({
  month: `M${i + 1}`,
  overdue: 8 + Math.round(Math.random() * 5) - (i === 11 ? 0 : 0),
  conception_rate: 58 + Math.sin(i * 0.5) * 6 + (i === 11 ? 3 : 0),
}))

export function GeneticsTab() {
  const { dateRange } = useAppStore()
  const pts = { '30d': 6, '3m': 8, '12m': 12, '2y': 24, '3y': 24, '5y': 12, 'all': 12 }[dateRange] ?? 12

  const COHORT_TREND_FILTERED = COHORT_TREND.slice(-Math.min(pts, COHORT_TREND.length))
  const BREEDING_FILTERED = BREEDING.slice(-Math.min(pts, BREEDING.length))
  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">

      {/* W23 Cohort trend + W26 Breeding */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* W23 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Genetic Merit by Birth-Year Cohort</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={COHORT_TREND_FILTERED} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[110, 160]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend formatter={v => <span style={{ fontSize: 10 }}>{v}</span>} />
              <ReferenceLine y={130} stroke="#94a3b8" strokeDasharray="4 2"
                label={{ value: 'Catalog avg', fontSize: 9, fill: '#94a3b8', position: 'right' }} />
              {['c2019','c2020','c2021','c2022','c2023'].map((k, i) => (
                <Line key={k} dataKey={k} stroke={['#94a3b8','#64748b','#006837','#00a651','#3b82f6'][i]}
                  strokeWidth={k === 'c2022' ? 3 : 1.5} dot={false} name={k.replace('c', 'Cohort ')} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* W26 Breeding Pipeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Breeding Pipeline</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BREEDING_FILTERED} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="count" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="rate" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v}%`} domain={[45, 75]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend formatter={v => <span style={{ fontSize: 11 }}>{v}</span>} />
              <Bar yAxisId="count" dataKey="overdue" fill="#f59e0b" radius={[3,3,0,0]} name="Cows overdue for breeding" />
              <Line yAxisId="rate" dataKey="conception_rate" stroke="#006837" strokeWidth={2} dot={false} name="Conception rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* W24 Performance by Quartile */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Performance by Genetic Quartile (Q1=best, Q4=worst)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Milk/cow/day (kg)', keys: ['q1_milk','q2_milk','q3_milk','q4_milk'] },
            { label: 'SCC (1000 cells/mL)', keys: ['q1_scc','q2_scc','q3_scc','q4_scc'] },
            { label: 'Mastitis rate (%)', keys: ['q1_mast','q2_mast','q3_mast','q4_mast'] },
          ].map(({ label, keys }) => (
            <div key={label}>
              <p className="text-xs text-gray-500 mb-2">{label}</p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={QUARTILE_DATA} margin={{ top: 2, right: 4, left: 0, bottom: 2 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  {keys.map((k, i) => (
                    <Line key={k} dataKey={k} stroke={['#006837','#64748b','#f59e0b','#ef4444'][i]}
                      strokeWidth={i === 0 ? 2.5 : 1.5} dot={false} name={`Q${i + 1}`} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>

      {/* W25 Sire Daughters Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Sire Daughters</h3>
        <p className="text-xs text-gray-400 mb-3">Minimum 15 daughters for inclusion · sorted by SCC avg</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500">
                <th className="text-left py-2 pr-4">Sire</th>
                <th className="text-right py-2 pr-4">Daughters</th>
                <th className="text-right py-2 pr-4">Avg SCC</th>
                <th className="text-center py-2 pr-4">SCC Trend</th>
                <th className="text-right py-2 pr-4">Avg Milk</th>
                <th className="text-right py-2">Conception %</th>
              </tr>
            </thead>
            <tbody>
              {[...SIRES].sort((a, b) => a.scc_avg - b.scc_avg).map(s => (
                <tr key={s.name} className="border-b border-gray-50 hover:bg-[#E8F5EE] cursor-pointer transition-colors">
                  <td className="py-2.5 pr-4 font-medium text-gray-900">{s.name}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-gray-700">{s.daughters}</td>
                  <td className={`py-2.5 pr-4 text-right tabular-nums font-semibold ${s.scc_avg < 120 ? 'text-[#006837]' : s.scc_avg < 160 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {s.scc_avg}k
                  </td>
                  <td className="py-2.5 pr-4 flex justify-center items-center">
                    {s.scc_trend === 'down' ? <TrendingDown className="h-4 w-4 text-[#006837]" />
                      : s.scc_trend === 'up' ? <TrendingUp className="h-4 w-4 text-rose-500" />
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-gray-700">{s.milk} kg</td>
                  <td className="py-2.5 text-right tabular-nums text-gray-700">{s.conception}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
