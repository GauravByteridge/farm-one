/**
 * DataTrustSection
 *
 * Shows the five data-trust dimensions that leadership needs to judge
 * whether metrics are reliable enough to act on:
 *  1. Coverage matrix   — which farms report to which sources and how fully
 *  2. Reconciliation    — matched / pending / unmatched entity counts
 *  3. Quality issues    — top issue categories with counts & severity
 *  4. Completeness trend — historical % of expected records received
 *  5. Coverage warnings — farms/sources with insufficient coverage
 */

import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Clock,
  ArrowRight, ChevronRight, Info, XCircle,
} from 'lucide-react'
import { fetchDataTrust } from '@/api/endpoints/trust'
import { cn } from '@/lib/utils'
import type { CoverageRow, QualityIssueCategory } from '@/types/api'

const SEV_STYLE: Record<string, string> = {
  high:   'text-rose-600   bg-rose-50   border-rose-200',
  medium: 'text-amber-600  bg-amber-50  border-amber-200',
  low:    'text-slate-500  bg-slate-50  border-slate-200',
  info:   'text-blue-500   bg-blue-50   border-blue-200',
}

const COVERAGE_COLOR = (pct: number | null) => {
  if (pct === null) return 'bg-gray-100 text-gray-400'
  if (pct >= 95) return 'bg-[#E8F5EE] text-[#006837] font-semibold'
  if (pct >= 90) return 'bg-amber-50 text-amber-700'
  return 'bg-rose-50 text-rose-600 font-semibold'
}

function CoverageMatrix({ rows }: { rows: CoverageRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 pr-4 text-gray-500 font-medium">Farm</th>
            {['Source A', 'Source B', 'Source C', 'Overall'].map(h => (
              <th key={h} className="text-center py-2 px-2 text-gray-500 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.farm_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-2 pr-4 text-gray-800 font-medium">{row.farm}</td>
              {[row.source_a, row.source_b, row.source_c, row.overall].map((pct, i) => (
                <td key={i} className="py-2 px-2 text-center">
                  {pct === null ? (
                    <span className="text-gray-300 text-[10px]">—</span>
                  ) : (
                    <span className={cn('inline-block px-2 py-0.5 rounded-full text-[11px]', COVERAGE_COLOR(pct))}>
                      {pct.toFixed(1)}%
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-gray-400 mt-2">
        Coverage = % of expected records actually received per source per farm. Threshold: ≥90% for reliable comparison.
      </p>
    </div>
  )
}

function ReconciliationCard({ data }: { data: {
  total_entities: number; matched: number; pending_review: number
  unmatched: number; match_rate: number; precision_eval: number; recall_eval: number; note: string
} }) {
  const total = data.total_entities
  const bars = [
    { label: 'Matched',        value: data.matched,        color: '#006837', pct: (data.matched / total * 100) },
    { label: 'Pending review', value: data.pending_review, color: '#f59e0b', pct: (data.pending_review / total * 100) },
    { label: 'Unmatched',      value: data.unmatched,      color: '#e11d48', pct: (data.unmatched / total * 100) },
  ]
  return (
    <div className="space-y-3">
      {bars.map(b => (
        <div key={b.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">{b.label}</span>
            <span className="font-semibold tabular-nums text-gray-900">
              {b.value.toLocaleString()} <span className="text-gray-400 font-normal">/ {total.toLocaleString()}</span>
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
          </div>
        </div>
      ))}
      <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
        <div className="text-center">
          <p className="text-gray-400">Match rate</p>
          <p className="text-lg font-bold text-[#006837]">{data.match_rate}%</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">F1 score</p>
          <p className="text-lg font-bold text-gray-700">
            {((data.precision_eval + data.recall_eval) / 2 * 100).toFixed(0)}%
          </p>
          <p className="text-[10px] text-gray-400">precision / recall</p>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 leading-relaxed">{data.note}</p>
    </div>
  )
}

function IssueTable({ issues }: { issues: QualityIssueCategory[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100">
            {['Issue', 'Count', '%', 'Severity', 'Sources', 'Action'].map(h => (
              <th key={h} className="text-left py-2 pr-3 text-gray-500 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {issues.map(iss => (
            <tr key={iss.rule} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-2 pr-3 text-gray-800 font-medium">{iss.category}</td>
              <td className="py-2 pr-3 tabular-nums font-semibold text-gray-900">{iss.count.toLocaleString()}</td>
              <td className="py-2 pr-3 tabular-nums text-gray-600">{iss.pct.toFixed(2)}%</td>
              <td className="py-2 pr-3">
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize', SEV_STYLE[iss.severity])}>
                  {iss.severity}
                </span>
              </td>
              <td className="py-2 pr-3 text-gray-500">{iss.sources.join(', ')}</td>
              <td className="py-2 pr-3 text-gray-600">{iss.disposition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DataTrustSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['data-trust'],
    queryFn: fetchDataTrust,
    staleTime: 60_000,
  })

  if (isLoading) return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-48" />
  )
  if (!data) return null

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center">
          <ShieldCheck className="h-4 w-4 text-[#006837]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Data Trust & Coverage</h2>
          <p className="text-xs text-gray-400">Is the data complete, consistent, and reliable enough to support decisions?</p>
        </div>
      </div>

      {/* Coverage warnings */}
      {data.coverage_warnings.length > 0 && (
        <div className="space-y-2">
          {data.coverage_warnings.map(w => (
            <div key={w.farm_id} className={cn(
              'flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm',
              w.severity === 'high' ? 'bg-rose-50 border-rose-200 text-rose-800'
                                    : 'bg-amber-50 border-amber-200 text-amber-800',
            )}>
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">{w.farm}</span>
                {' — '}{w.issue}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Three-column: Coverage Matrix | Reconciliation | Issue categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Coverage matrix */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Farm × Source Coverage</h3>
          <CoverageMatrix rows={data.coverage_matrix} />
        </div>

        {/* Reconciliation */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Entity Reconciliation</h3>
          <ReconciliationCard data={data.reconciliation} />
        </div>

        {/* Quality issues */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Quality Issue Categories</h3>
          <IssueTable issues={data.quality_issues} />
        </div>
      </div>

      {/* Data completeness trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Data Completeness Trend</h3>
            <p className="text-xs text-gray-400 mt-0.5">% of expected records received · numerator / denominator shown in tooltip</p>
          </div>
          <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
            90% threshold
          </span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data.completeness_trend.map(pt => ({
            ...pt,
            label: new Date(pt.month + '-01').toLocaleDateString('en-GB', { month: 'short' }),
          }))} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis domain={[88, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}%`} />
            <Tooltip
              formatter={(v: number, _n: string, props: any) => [
                `${v.toFixed(1)}% (${props.payload.records.toLocaleString()} records)`,
                'Completeness',
              ]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            {/* 90% reference band */}
            <Line type="monotone" dataKey={() => 90} stroke="#fca5a5" strokeWidth={1}
              strokeDasharray="4 2" dot={false} name="90% threshold" legendType="none" />
            <Line type="monotone" dataKey="completeness" stroke="#006837" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
