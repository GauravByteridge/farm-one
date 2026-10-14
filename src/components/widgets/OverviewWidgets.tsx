/**
 * W8–W12: Margin Trend, Driver Waterfall, Heat Stress, Anomaly Calendar, Daily Briefing
 */
import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import { Sparkles, RefreshCw, ArrowRight, Flame, Triangle, Plus } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/lib/utils'

// ─── W8 Mock ─────────────────────────────────────────────────────────────────

const MARGIN_DATA = Array.from({ length: 90 }, (_, i) => {
  const base = 5.2 - (i >= 38 && i <= 52 ? 1.4 * Math.sin((i - 38) / 14 * Math.PI) : 0)
  const val = base + Math.sin(i * 0.2) * 0.3 + (Math.random() - 0.5) * 0.2
  return {
    day: i + 1,
    margin: parseFloat(val.toFixed(2)),
    avg7: null as number | null,
    ration: i === 20 || i === 55,
    heat: i >= 36 && i <= 54,
    treatment: i === 48,
  }
}).map((d, i, arr) => ({
  ...d,
  avg7: i >= 6 ? parseFloat((arr.slice(i - 6, i + 1).reduce((s, x) => s + x.margin, 0) / 7).toFixed(2)) : null,
}))

// ─── W9 Waterfall ────────────────────────────────────────────────────────────

const WATERFALL_DATA = [
  { name: 'Baseline',   value: 5.2,  cumulative: 5.2,  color: '#64748b' },
  { name: 'Milk yield', value: 0.8,  cumulative: 6.0,  color: '#006837' },
  { name: 'Feed cost',  value: -0.6, cumulative: 5.4,  color: '#ef4444' },
  { name: 'SCC adj.',   value: -0.3, cumulative: 5.1,  color: '#ef4444' },
  { name: 'Discards',   value: -0.2, cumulative: 4.9,  color: '#ef4444' },
  { name: 'Treatment',  value: -0.1, cumulative: 4.8,  color: '#ef4444' },
  { name: 'Net margin', value: 4.8,  cumulative: 4.8,  color: '#006837' },
]

// ─── W10 Heat Stress ─────────────────────────────────────────────────────────

const HEAT_DATA = Array.from({ length: 90 }, (_, i) => ({
  day: i + 1,
  thi: 62 + Math.sin(i * 0.12) * 8 + (i >= 36 && i <= 54 ? 6 + Math.sin((i - 36) * 0.3) * 3 : 0),
  milk_idx: 100 - (i >= 38 && i <= 56 ? (i - 38) * 0.4 : 0) + Math.sin(i * 0.15) * 1.5,
  feed_idx: 100 - (i >= 36 && i <= 52 ? (i - 36) * 0.35 : 0) + Math.sin(i * 0.1) * 2,
}))

// ─── W11 Anomaly Calendar ────────────────────────────────────────────────────

const FARMS_LIST = ['Green Valley', 'Sunrise Farm', 'Hillside Ranch', 'Valley View', 'Blue Ridge']
const ANOMALY_GRID = FARMS_LIST.map((farm, fi) =>
  Array.from({ length: 90 }, (_, di) => {
    const base = Math.random()
    const isHillside = fi === 2
    const hotWindow = di >= 38 && di <= 54
    const score = isHillside && hotWindow ? 0.7 + Math.random() * 0.3
                : hotWindow ? 0.2 + Math.random() * 0.3
                : base < 0.05 ? 0.4 + Math.random() * 0.3
                : 0
    return score
  })
)

function anomalyColor(score: number) {
  if (score > 0.65) return '#ef4444'
  if (score > 0.3)  return '#f59e0b'
  if (score > 0.05) return '#86efac'
  return '#E8F5EE'
}

// ─── W12 Daily Briefing ──────────────────────────────────────────────────────

const BRIEFINGS = [
  [
    "Farm-wide margin per cow dropped to €4.80/day, down €0.42 from last week.",
    "Key driver: milk yield declined 8% on Hillside Ranch, contributing −€0.22/cow.",
    "Feed cost increased on Pen 4 (+9% corn silage vs target), adding −€0.12/cow.",
    "Somatic cell count rose above 200k on 18% of Hillside cows — up from 9% last week.",
    "Action: Veterinary review of Pen 2 milking routine; check Pen 4 scale calibration.",
  ],
  [
    "Margins stabilised at €4.85/day following ration adjustment on Jul 12.",
    "Hillside Ranch SCC trending down — 14% of cows above 200k vs 18% last week.",
    "Valley View showing strong performance: 31.2 kg/cow, 4th consecutive week above 30.",
    "Heat stress risk remains elevated; THI above 68 on 12 of last 14 days.",
    "Action: Confirm feed delivery times are before 06:00 and after 20:00 during heat period.",
  ],
]

// ─── Components ──────────────────────────────────────────────────────────────

export function W8MarginTrend() {
  const [days, setDays] = useState(90)
  const sliced = MARGIN_DATA.slice(MARGIN_DATA.length - days)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Margin Trend with Events</h3>
          <p className="text-xs text-gray-400 mt-0.5">€/cow/day · ▲ ration change · 🔥 heat stress · + treatment</p>
        </div>
        <div className="flex gap-1">
          {[30, 60, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={cn('text-xs px-2.5 py-1 rounded-lg border transition-colors',
                days === d ? 'bg-[#006837] text-white border-[#006837]' : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
              {d}d
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={sliced} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={Math.floor(days / 6)} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
            tickFormatter={v => `€${v.toFixed(1)}`} domain={[3.0, 6.0]} />
          <Tooltip formatter={(v: number, n: string) => [`€${(v as number).toFixed(2)}`, n === 'margin' ? 'Margin/cow' : '7d avg']}
            contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          {/* Heat stress shading via reference areas approximated */}
          {sliced.filter(d => d.heat).slice(0, 1).map(d => (
            <ReferenceLine key="hs-start" x={d.day} stroke="#f59e0b" strokeOpacity={0.3} />
          ))}
          {sliced.filter(d => d.ration).map(d => (
            <ReferenceLine key={`rc-${d.day}`} x={d.day} stroke="#006837" strokeDasharray="3 3"
              label={{ value: '▲', fontSize: 11, fill: '#006837' }} />
          ))}
          {sliced.filter(d => d.treatment).map(d => (
            <ReferenceLine key={`tr-${d.day}`} x={d.day} stroke="#6366f1"
              label={{ value: '+', fontSize: 13, fill: '#6366f1' }} />
          ))}
          <Line dataKey="margin" stroke="#006837" strokeWidth={2} dot={false} name="margin" />
          <Line dataKey="avg7" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="7d avg" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function W9DriverWaterfall() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Margin Driver Waterfall</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={WATERFALL_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
            tickFormatter={v => `€${v.toFixed(1)}`} domain={[0, 7]} />
          <Tooltip formatter={(v: number) => [`€${(v as number).toFixed(2)}`, 'Value']}
            contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} name="value">
            {WATERFALL_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function W10HeatStress() {
  const sliced = HEAT_DATA.slice(-90)
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-1">Heat Stress Timeline</h3>
      <p className="text-xs text-gray-400 mb-4">THI line (left) with threshold shading · Milk & Feed indexed to 100 (right)</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={sliced} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={10} />
          <YAxis yAxisId="thi" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[55, 82]} />
          <YAxis yAxisId="idx" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
            domain={[88, 104]} tickFormatter={v => `${v}`} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <ReferenceLine yAxisId="thi" y={68} stroke="#f59e0b" strokeDasharray="4 2"
            label={{ value: 'THI 68', fontSize: 9, fill: '#f59e0b', position: 'right' }} />
          <ReferenceLine yAxisId="thi" y={72} stroke="#ef4444" strokeDasharray="4 2"
            label={{ value: 'THI 72', fontSize: 9, fill: '#ef4444', position: 'right' }} />
          <Line yAxisId="thi" dataKey="thi" stroke="#ef4444" strokeWidth={2} dot={false} name="THI" />
          <Line yAxisId="idx" dataKey="milk_idx" stroke="#006837" strokeWidth={1.5} dot={false} name="Milk idx" />
          <Line yAxisId="idx" dataKey="feed_idx" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" dot={false} name="Feed idx" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function W11AnomalyCalendar() {
  const [hovered, setHovered] = useState<{ farm: string; day: number; score: number } | null>(null)
  const COLS = 90
  const COL_W = Math.max(6, Math.floor(680 / COLS))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Anomaly Calendar (Farms × Days)</h3>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {[['Normal', '#E8F5EE'], ['Mild', '#86efac'], ['Moderate', '#f59e0b'], ['High', '#ef4444']].map(([l, c]) => (
            <div key={l} className="flex items-center gap-1">
              <div className="h-3 w-3 rounded" style={{ background: c }} />
              {l}
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: COLS * COL_W + 100 }}>
          {FARMS_LIST.map((farm, fi) => (
            <div key={farm} className="flex items-center mb-1">
              <span className="text-xs text-gray-500 w-[100px] shrink-0 truncate">{farm}</span>
              <div className="flex gap-0.5">
                {ANOMALY_GRID[fi].map((score, di) => (
                  <div
                    key={di}
                    style={{ width: COL_W, height: 18, background: anomalyColor(score), borderRadius: 2, cursor: score > 0.3 ? 'pointer' : 'default' }}
                    onMouseEnter={() => score > 0.1 && setHovered({ farm, day: di + 1, score })}
                    onMouseLeave={() => setHovered(null)}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="flex mt-1">
            <div className="w-[100px] shrink-0" />
            {[1, 15, 30, 45, 60, 75, 90].map(d => (
              <span key={d} className="text-[9px] text-gray-300" style={{ marginLeft: (d - 1) * COL_W + (d === 1 ? 0 : 0) - 4 }}>
                D{d}
              </span>
            ))}
          </div>
        </div>
      </div>
      {hovered && (
        <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
          <b>{hovered.farm}</b> · Day {hovered.day} · Anomaly score: <b>{(hovered.score * 100).toFixed(0)}</b>
        </div>
      )}
    </div>
  )
}

export function W12DailyBriefing() {
  const [ver, setVer] = useState(0)
  const { openWithQuestion } = useAppStore()
  const lines = BRIEFINGS[ver]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-[#006837]" />
        <h3 className="text-sm font-semibold text-gray-800">Daily Briefing</h3>
        <span className="text-[10px] text-[#008a43] bg-[#E8F5EE] px-2 py-0.5 rounded-full">Generated from verified data</span>
        <button onClick={() => setVer(v => 1 - v)}
          className="ml-auto text-xs flex items-center gap-1 text-gray-400 hover:text-gray-700 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Regenerate
        </button>
      </div>
      <ol className="space-y-2">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
            <span className="h-5 w-5 rounded-full bg-[#E8F5EE] text-[#006837] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="flex-1 leading-relaxed">{line}</span>
            <button onClick={() => openWithQuestion(`Explain: ${line.slice(0, 60)}`)}
              className="shrink-0 text-[10px] text-[#006837] bg-[#E8F5EE] px-2 py-0.5 rounded-full hover:bg-[#D0EBD9] transition-colors whitespace-nowrap">
              Ask AI
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
