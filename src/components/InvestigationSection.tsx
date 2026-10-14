/**
 * InvestigationSection
 *
 * Shows pre-computed investigation cards grouped by type:
 *  - Production change
 *  - Data reliability risk
 *  - Cross-source reconciliation gap
 *  - Seasonal anomaly
 *
 * Each card: finding, period, supporting records, coverage, limitation, chart, next steps.
 * "Ask a question" chips route to the AI chat panel.
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts'
import {
  Sparkles, TrendingDown, TrendingUp, AlertTriangle,
  GitMerge, ChevronDown, ChevronUp, ArrowRight, Info,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchInvestigations } from '@/api/endpoints/investigations'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/lib/utils'
import type { InvestigationCard } from '@/types/api'

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  production_change:           TrendingDown,
  data_reliability:            AlertTriangle,
  cross_source_reconciliation: GitMerge,
  seasonal_anomaly:            TrendingUp,
}

const SEV_BADGE: Record<string, string> = {
  high:   'bg-rose-50   text-rose-700   border-rose-200',
  medium: 'bg-amber-50  text-amber-700  border-amber-200',
  low:    'bg-slate-50  text-slate-600  border-slate-200',
  info:   'bg-[#E8F5EE] text-[#006837] border-[#D0EBD9]',
}

const DIR_COLOR: Record<string, string> = {
  down: 'text-rose-600',
  up:   'text-[#006837]',
  warn: 'text-amber-600',
  info: 'text-blue-600',
}

function MiniChart({ card }: { card: InvestigationCard }) {
  if (card.type === 'production_change') {
    return (
      <ResponsiveContainer width="100%" height={110}>
        <LineChart data={card.chart_data as any[]} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}kg`} domain={['auto', 'auto']} />
          <Tooltip formatter={(v: number, n: string) => [`${v.toFixed(1)} kg`, n === 'current' ? 'Current' : 'Baseline']}
            contentStyle={{ fontSize: 11, borderRadius: 6 }} />
          <Line dataKey="baseline" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="baseline" />
          <Line dataKey="current"  stroke="#e11d48" strokeWidth={2} dot={false} name="current" />
        </LineChart>
      </ResponsiveContainer>
    )
  }
  if (card.type === 'data_reliability') {
    const data = card.chart_data as any[]
    return (
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="source" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={60} />
          <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Coverage']}
            contentStyle={{ fontSize: 11, borderRadius: 6 }} />
          <ReferenceLine x={90} stroke="#f59e0b" strokeDasharray="3 3"
            label={{ value: '90%', fontSize: 9, fill: '#f59e0b', position: 'right' }} />
          <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
            {data.map((d, i) => (
              <Bar key={i} dataKey="pct" fill={d.pct >= 90 ? '#006837' : '#f59e0b'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }
  if (card.type === 'cross_source_reconciliation') {
    const d = card.chart_data as any[]
    return (
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={d} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="source" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
          <Bar dataKey="matched"    fill="#006837" radius={[2,2,0,0]} name="Matched" />
          <Bar dataKey="quarantined" fill="#f59e0b" radius={[2,2,0,0]} name="Quarantined" />
          <Bar dataKey="pending"    fill="#94a3b8" radius={[2,2,0,0]} name="Pending" />
        </BarChart>
      </ResponsiveContainer>
    )
  }
  if (card.type === 'seasonal_anomaly') {
    const d = card.chart_data as any[]
    return (
      <ResponsiveContainer width="100%" height={110}>
        <AreaChart data={d} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="seasonBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#94a3b8" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}kg`} domain={[25, 34]} />
          <Tooltip formatter={(v: number, n: string) => [`${v.toFixed(1)} kg`, n]}
            contentStyle={{ fontSize: 11, borderRadius: 6 }} />
          <Area dataKey="seasonal_high" fill="url(#seasonBand)" stroke="transparent" name="Seasonal high" />
          <Area dataKey="seasonal_low"  fill="white"            stroke="transparent" name="Seasonal low" />
          <Line dataKey="actual" stroke="#006837" strokeWidth={2.5} dot={{ fill: '#006837', r: 3 }} name="Actual" />
        </AreaChart>
      </ResponsiveContainer>
    )
  }
  return null
}

function InvCard({ card }: { card: InvestigationCard }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const Icon = TYPE_ICON[card.type] ?? Info

  return (
    <div className={cn('bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-sm',
      card.severity === 'high' ? 'border-rose-200' : card.severity === 'info' ? 'border-[#D0EBD9]' : 'border-gray-200',
    )}>
      {/* Card header */}
      <div className="px-4 py-4 space-y-2.5">
        <div className="flex items-start gap-3">
          <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
            card.severity === 'high' ? 'bg-rose-50' : card.severity === 'info' ? 'bg-[#E8F5EE]' : 'bg-amber-50',
          )}>
            <Icon className={cn('h-4 w-4',
              card.severity === 'high' ? 'text-rose-600' : card.severity === 'info' ? 'text-[#006837]' : 'text-amber-600',
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-sm font-bold text-gray-900">{card.title}</span>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize', SEV_BADGE[card.severity])}>
                {card.severity}
              </span>
            </div>
            <p className="text-xs text-gray-500">{card.subtitle}</p>
          </div>
          <div className={cn('text-base font-bold tabular-nums shrink-0', DIR_COLOR[card.magnitude_dir])}>
            {card.magnitude}
          </div>
        </div>

        {/* Finding */}
        <p className="text-sm text-gray-700 leading-relaxed">{card.finding}</p>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span>📅 {card.period}</span>
          <span>📊 {card.records_supporting.toLocaleString()} records</span>
          <span>🎯 {card.coverage} coverage</span>
        </div>

        {/* Limitation */}
        <div className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{card.limitation}</span>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-1.5 px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? 'Hide chart' : 'Show supporting chart'}
      </button>

      {/* Expanded chart */}
      {expanded && (
        <div className="px-4 pt-3 pb-2">
          <MiniChart card={card} />
        </div>
      )}

      {/* Next steps */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-wrap">
        {card.next_steps.map(ns => (
          <button
            key={ns.label}
            onClick={() => navigate(ns.route)}
            className="flex items-center gap-1 text-xs text-[#006837] bg-[#E8F5EE] border border-[#D0EBD9] hover:bg-[#006837] hover:text-white rounded-lg px-2.5 py-1.5 transition-colors font-medium"
          >
            {ns.label} <ArrowRight className="h-3 w-3" />
          </button>
        ))}
      </div>
    </div>
  )
}

export function InvestigationSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['investigations'],
    queryFn: fetchInvestigations,
    staleTime: 60_000,
  })
  const { openWithQuestion } = useAppStore()

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-48" />
      ))}
    </div>
  )
  if (!data) return null

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-[#006837]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">AI Investigation</h2>
            <p className="text-xs text-gray-400">Evidence-backed findings · click to expand chart · navigate to source</p>
          </div>
        </div>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
          Findings based on verified Gold-layer data. Associations shown are not causal claims.
        </p>
      </div>

      {/* Investigation cards 2-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.cards.map(card => <InvCard key={card.id} card={card} />)}
      </div>

      {/* Suggested questions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-[#006837]" />
          <h3 className="text-sm font-semibold text-gray-800">Ask a question about all farms</h3>
          <span className="text-xs text-gray-400 ml-auto">Opens AI chat panel →</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.suggested_questions.map(q => (
            <button
              key={q}
              onClick={() => openWithQuestion(q)}
              className="text-left text-xs bg-gray-50 hover:bg-[#E8F5EE] border border-gray-100 hover:border-[#D0EBD9] rounded-lg px-3 py-2.5 text-gray-700 transition-all flex items-center justify-between group"
            >
              <span>{q}</span>
              <ArrowRight className="h-3 w-3 text-gray-300 group-hover:text-[#006837] shrink-0 ml-2 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
