/**
 * AiChatPanel — Farm One AI Assistant
 * URUS-themed sliding panel with full conversation, recommendations, and analysis.
 * Input is always visible. Panel uses #006837 brand throughout.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  X, Plus, ChevronRight, ChevronDown, Sparkles, ThumbsUp, ThumbsDown,
  Send, CheckCircle2, BarChart2, DollarSign, Droplets, ShieldCheck,
  HelpCircle, Loader2, ExternalLink, Trash2, Wand2, Lightbulb,
  ArrowRight, Clock, Wrench, TrendingUp, Leaf,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'HIGH' | 'MEDIUM' | 'LOW'
interface Factor { id: string; label: string; severity: Severity; detail: string }

interface AnalysisResult {
  confidence: number; answer: string
  metric_id?: string; metric_name?: string; display_name?: string
  unit?: string; value?: number | string
  is_certified?: boolean
  contributing_factors?: Factor[]
  data_quality_note?: string; calculation_note?: string; lineage_id?: string
  is_ambiguous?: boolean; suggested_refinements?: string[]; is_unsupported?: boolean
}

interface Message {
  id: string; role: 'user' | 'assistant'
  text: string; analysis?: AnalysisResult; timestamp: Date
}

interface SuggestedQuestion {
  text: string; icon: React.ComponentType<{ className?: string }>
}

// ─── Mock scripted responses ──────────────────────────────────────────────────

const MOCK_RESPONSES: Record<string, AnalysisResult> = {
  // ── Hard operational questions ──────────────────────────────────────────
  "Why did milk yield decline on Hillside Ranch?": {
    confidence: 84, value: '−12.4%', unit: 'vs 90d baseline',
    answer: "Hillside Ranch shows a 12.4% decline in avg milk/cow/day vs its 90-day baseline. Key drivers: (1) Feed delivery dropped 9% below target in weeks 6–8 due to Scale 2 calibration issues. (2) SCC rose above 200k on 18% of cows — up from 9% — indicating an udder-health event. (3) Source B missing 14.3% of records, so the true decline may be larger.",
    metric_id: 'MET-003', metric_name: 'avg_daily_milk_per_cow', display_name: 'Average Daily Milk per Cow', is_certified: true,
    contributing_factors: [
      { id: 'f1', label: 'Feed Delivery Below Target (Scale 2)', severity: 'HIGH' as const, detail: 'Pen 4 corn silage +9% deviation for 3 weeks. Scale 2 consistently over-reports. Recommend calibration check.' },
      { id: 'f2', label: 'SCC Elevation — Possible Mastitis Event', severity: 'HIGH' as const, detail: '18% of cows above 200k SCC vs 9% prior period. Pen 2 has highest concentration.' },
      { id: 'f3', label: 'Source B Data Gap', severity: 'MEDIUM' as const, detail: 'Source B only 85.7% complete for this farm. Actual decline may be understated.' },
    ],
    data_quality_note: 'Analysis based on 3,240 records from RUN-2024-002. Single-source feed data — treat with caution.',
    lineage_id: 'LIN-MET003-FARM00203',
    calculation_note: "AVG(avg_milk_per_cow_kg) FROM gold.farm_metrics_daily WHERE canonical_farm_id = 'FARM-00203'",
  },
  "What is the farm-wide margin per cow?": {
    confidence: 91, value: '€4.80', unit: '/cow/day',
    answer: "Farm-wide gross margin per cow is €4.80/day, down €0.42 from the prior 30-day period. Valley View (NL) leads at €5.48 — 14% above group average. Hillside Ranch is lowest at €3.24, driven by high feed cost ($0.392/kg milk) and lower yield.",
    metric_id: 'MET-005', metric_name: 'feed_cost_per_kg_milk', display_name: 'Feed Cost per kg Milk', is_certified: true,
    contributing_factors: [
      { id: 'f1', label: 'Feed Cost Increase (+4.2% MoM)', severity: 'HIGH' as const, detail: 'Corn silage price +6.8% vs reference. Pen 4 overfeed compounds the cost increase.' },
      { id: 'f2', label: 'Hillside Ranch Dragging Average', severity: 'HIGH' as const, detail: 'Hillside at €3.24 is €1.56 below Valley View. Removing it raises group avg to €5.01.' },
      { id: 'f3', label: 'Entity Resolution Impact', severity: 'MEDIUM' as const, detail: 'Valley View improved from rank 3 to rank 1 after 14 duplicate animals were resolved.' },
    ],
    data_quality_note: 'Based on May 2024 data. Hillside Ranch has single-source feed data.',
    lineage_id: 'LIN-MET005-202405',
    calculation_note: "SELECT AVG(gross_margin_eur / total_milk_kg) FROM gold.feed_cost_analysis WHERE period_year = 2024 AND period_month = 5",
  },
  "Which farms have the largest sustained decline in milk production?": {
    confidence: 88, value: '3 farms', unit: 'declining',
    answer: "Three farms show sustained 90-day declines: (1) Hillside Ranch −12.4% — most severe, linked to feed issues and SCC elevation. (2) Sunrise Farm −4.8% — Source B data gap may exaggerate. (3) Shannon Valley −3.1% — within seasonal norms. Valley View, De Waard Hoeve, and Green Valley are stable or improving.",
    metric_id: 'MET-003', metric_name: 'avg_daily_milk_per_cow', display_name: 'Average Daily Milk per Cow', is_certified: true,
    contributing_factors: [
      { id: 'f1', label: 'Hillside Ranch — 10-week Sustained Decline', severity: 'HIGH' as const, detail: '−12.4% vs 90d baseline. Feed + SCC confirmed across 11 of last 14 weeks.' },
      { id: 'f2', label: 'Sunrise Farm — Data Reliability Risk', severity: 'MEDIUM' as const, detail: '−4.8% but Source B only 85.7% complete. Decline may be partly a data artefact.' },
      { id: 'f3', label: 'Shannon Valley — Within Seasonal Norms', severity: 'LOW' as const, detail: '−3.1% within ±5% seasonal band. Monitor but no immediate action needed.' },
    ],
    data_quality_note: 'Declines measured vs 90-day historical baseline per farm.',
    lineage_id: 'LIN-MET003-MULTI-20240615',
    calculation_note: "SELECT canonical_farm_id, (current_avg - baseline_avg)/baseline_avg * 100 AS pct_change FROM gold.farm_metrics_daily",
  },
  "Compare farm performance accounting for data coverage": {
    confidence: 82, value: '4/13 farms', unit: 'reliable',
    answer: "Of 13 farms, 4 have >95% data coverage and reliable comparisons: Valley View (98.5%), Green Valley (95.5%), De Waard (98.2%), and Canterbury (93.4%). Hillside Ranch (82.3%) and Sunrise Farm (91.0%) should be treated with caution. Perthshire Cattle Co. has the lowest coverage at 86.3% and should not be included in cross-farm rankings.",
    metric_id: 'MET-007', metric_name: 'data_quality_pass_rate', display_name: 'Data Quality Pass Rate', is_certified: true,
    contributing_factors: [
      { id: 'f1', label: '4 Farms Below 90% Threshold', severity: 'HIGH' as const, detail: 'Hillside (82.3%), Perthshire (86.3%), Shannon Valley (89.4%), Sunrise (91.0%) — all below reliable comparison threshold.' },
      { id: 'f2', label: 'Source C Not Reporting for Beef Farms', severity: 'MEDIUM' as const, detail: 'Hillside Ranch and Perthshire Cattle Co. are beef farms — Source C does not report for them. Only 2 sources available.' },
    ],
    data_quality_note: 'Coverage threshold of 90% recommended for reliable cross-farm comparison.',
    lineage_id: 'LIN-MET007-COVERAGE',
    calculation_note: "SELECT canonical_farm_id, overall FROM gold.data_trust ORDER BY overall DESC",
  },
  // ── Standard questions ───────────────────────────────────────────────────
  "Why is Source B's quarantine rate higher than other sources?": {
    confidence: 87, value: '91.4', unit: '%',
    answer: "Source B (FarmCore ERP) has the highest quarantine rate at 3.5% — nearly 3× Source C's rate of 1.2%. Primary driver: high frequency of duplicate animal records ingested across multiple batch runs, combined with records missing required identifiers.",
    metric_id: 'MET-007', metric_name: 'data_quality_pass_rate', display_name: 'Data Quality Pass Rate', is_certified: true,
    contributing_factors: [
      { id: 'f1', label: 'Duplicate Animal Records', severity: 'HIGH', detail: '18 duplicate records detected in Source B, compared to 5 in Source A and 2 in Source C.' },
      { id: 'f2', label: 'Missing Required Identifiers', severity: 'MEDIUM', detail: '24 Source B animal records have no ear_tag, EID, or registration number.' },
      { id: 'f3', label: 'Unit Inconsistency (lb → kg)', severity: 'MEDIUM', detail: '31 Source B milk records reported in lbs instead of kg — auto-corrected via QR-UNIT-001.' },
      { id: 'f4', label: 'Schema Drift', severity: 'LOW', detail: '2 records contain unexpected field names not in the registered Source B schema.' },
    ],
    data_quality_note: 'Source B quality assessed from run RUN-2024-002. 1,215 total animal records; 42 quarantined.',
    lineage_id: 'LIN-MET007-20240615',
    calculation_note: "quarantined_records / total_records × 100 FROM gold.dq_summary WHERE source_system = 'source_b'",
  },
  'Which farms have feed costs above their cohort average?': {
    confidence: 93, value: '0.307', unit: 'USD/kg',
    answer: "As of May 2024, 2 of 5 farms have feed costs above their cohort average. Hillside Ranch is highest at $0.392/kg — 27.6% above cohort. Entity resolution changed the ranking for 2 farms: Valley View improved from rank 3 to rank 1.",
    metric_id: 'MET-005', metric_name: 'feed_cost_per_kg_milk', display_name: 'Feed Cost per kg Milk', is_certified: true,
    contributing_factors: [
      { id: 'f1', label: 'Hillside Ranch — Highest Cost', severity: 'HIGH', detail: '$0.392/kg — 27.6% above cohort average of $0.307/kg. Single-source reporting (Source B only).' },
      { id: 'f2', label: 'Sunrise Farm — Marginally Above', severity: 'MEDIUM', detail: '$0.318/kg — 3.5% above cohort average. Rank: 4 of 5.' },
      { id: 'f3', label: 'Entity Resolution Changed Rankings', severity: 'MEDIUM', detail: 'Valley View improved from rank 3 to rank 1 after resolving 14 duplicate animal records.' },
    ],
    data_quality_note: 'Feed cost data for May 2024. Hillside Ranch has single-source feed data — treat with caution.',
    lineage_id: 'LIN-MET005-202405',
    calculation_note: "SELECT cost_per_kg_milk FROM gold.feed_cost_analysis WHERE period_year = 2024 AND period_month = 5",
  },
  'How many active milking cows are there?': {
    confidence: 99, value: '1,842', unit: 'cows',
    answer: "There are 1,842 active milking cows across all 5 farms as of June 15, 2024 (run RUN-2024-002). This is the reconciled Gold-layer figure after entity resolution removed 97 duplicate records.",
    metric_id: 'MET-002', metric_name: 'active_milking_cow_count', display_name: 'Active Milking Cows', is_certified: true,
    contributing_factors: [
      { id: 'f1', label: 'Source Disagreement — 246 Cow Gap', severity: 'HIGH', detail: 'Source A: 1,920 · Source B: 1,674 · Source C: 1,901. Reconciled Gold: 1,842.' },
      { id: 'f2', label: 'Entity Resolution Removed 97 Duplicates', severity: 'MEDIUM', detail: '93 auto-merged, 4 manually reviewed. Without resolution Gold total would be ~1,939.' },
    ],
    data_quality_note: "Active milking cow definition: is_milking_cow = true AND status = active AND days_in_milk ≤ 305.",
    lineage_id: 'LIN-MET002-20240615',
    calculation_note: "SUM(active_milking_cow_count) FROM gold.farm_metrics_daily WHERE metric_date = '2024-06-15'",
  },
  'What is the average daily milk per cow?': {
    confidence: 95, value: '28.4', unit: 'kg/cow/day',
    answer: "The average daily milk yield is 28.4 kg/cow/day across all farms. Valley View leads at 31.2 kg/cow/day, while Hillside Ranch is lowest at 22.1 kg/cow/day. Source B originally reported in lbs and was auto-corrected.",
    metric_id: 'MET-003', metric_name: 'avg_daily_milk_per_cow', display_name: 'Average Daily Milk per Cow', is_certified: true,
    contributing_factors: [
      { id: 'f1', label: 'Unit Standardisation (lb → kg)', severity: 'MEDIUM', detail: 'Source B reported milk in lbs. Rule QR-UNIT-001 auto-converted using factor 0.453592.' },
      { id: 'f2', label: 'Robotic Milking Aggregation', severity: 'LOW', detail: 'Valley View uses robotic milking with multiple sessions per day. All sessions aggregated to full-day totals.' },
    ],
    data_quality_note: 'Quarantined records excluded. 9 records with implausible values (>60 kg/day) quarantined by QR-PLAUS-002.',
    lineage_id: 'LIN-MET003-20240615',
    calculation_note: "AVG(avg_milk_per_cow_kg) FROM gold.farm_metrics_daily WHERE metric_date = '2024-06-15'",
  },
  "What's the overall data quality?": {
    confidence: 91, value: '94.1', unit: '%',
    answer: "Overall data quality pass rate is 94.1%. Source C is best at 96.7%; Source B is lowest at 91.4%. Most common issue: unit inconsistency (milk reported in lbs or litres). 782 records quarantined total.",
    metric_id: 'MET-007', metric_name: 'data_quality_pass_rate', display_name: 'Data Quality Pass Rate', is_certified: true,
    contributing_factors: [
      { id: 'f1', label: 'Unit Inconsistencies (Most Common)', severity: 'HIGH', detail: '61 records across all sources reported milk in lbs or litres. All auto-corrected via QR-UNIT-001.' },
      { id: 'f2', label: 'Implausible Values', severity: 'MEDIUM', detail: '11 records had milk yields outside biological range. All quarantined by QR-PLAUS-002.' },
      { id: 'f3', label: 'Future Dates', severity: 'MEDIUM', detail: '3 animal records had birth_date in the future. Quarantined by QR-DATE-003.' },
      { id: 'f4', label: 'Missing Identifiers', severity: 'LOW', detail: '42 records (mostly Source B) have no ear_tag, EID, or registration_number.' },
    ],
    data_quality_note: 'Summary from run RUN-2024-002 covering 3,835 total records.',
    lineage_id: 'LIN-MET007-20240615',
    calculation_note: "SUM(passed_records) / SUM(total_records) × 100 FROM gold.dq_summary WHERE run_id = :run_id",
  },
}

const SUGGESTED: SuggestedQuestion[] = [
  { text: "Which farms have the largest sustained decline in milk production?", icon: ShieldCheck },
  { text: 'What is the farm-wide margin per cow?', icon: DollarSign },
  { text: "Why did milk yield decline on Hillside Ranch?", icon: Droplets },
  { text: 'Compare farm performance accounting for data coverage', icon: BarChart2 },
  { text: "What's the overall data quality across all sources?", icon: ShieldCheck },
]

function getMockResponse(question: string): AnalysisResult {
  if (MOCK_RESPONSES[question]) return MOCK_RESPONSES[question]
  const q = question.toLowerCase()
  const key = Object.keys(MOCK_RESPONSES).find(k =>
    k.toLowerCase().split(' ').some(w => w.length > 4 && q.includes(w))
  )
  if (key) return MOCK_RESPONSES[key]
  return {
    confidence: 60,
    answer: "I can only answer questions about certified metrics in the Farm One registry: active animals, milking cows, average daily milk, feed cost per kg, and data quality rates. Please rephrase or try one of the suggested questions.",
    is_unsupported: true,
    contributing_factors: [],
  }
}

// ─── Recommendations data ────────────────────────────────────────────────────

type RecType = 'immediate' | 'monitor' | 'process' | 'investigate'
interface Recommendation { type: RecType; title: string; detail: string; effort: 'Low' | 'Medium' | 'High' }

const FACTOR_RECS: Record<string, Recommendation[]> = {
  dup: [
    { type: 'immediate', title: 'Deduplicate Source B batch windows', detail: 'Configure FarmCore ERP to include a unique batch_export_id on every export.', effort: 'Medium' },
    { type: 'monitor', title: 'Alert when duplicate_rate > 1%', detail: 'Set up automated alert when duplicate_count / total_records exceeds 1%.', effort: 'Low' },
  ],
  missing: [
    { type: 'process', title: 'Enforce mandatory identifiers in Source B', detail: 'Request FarmCore ERP team to make ear_tag OR eid a required field. 24 records currently quarantined.', effort: 'Low' },
    { type: 'investigate', title: 'Review 24 quarantined records manually', detail: 'Cross-reference against farm physical tag log. Assign canonical IDs for confirmed animals.', effort: 'Medium' },
  ],
  unit: [
    { type: 'immediate', title: 'Configure Source B to export kg by default', detail: 'Work with FarmCore ERP admin to set default milk unit to kg in export profile.', effort: 'Low' },
  ],
  cost: [
    { type: 'investigate', title: 'Audit Hillside Ranch feed mix', detail: "Hillside Ranch's cost ($0.392/kg) is 27.6% above cohort. Compare feed_type breakdown with Valley View.", effort: 'Medium' },
  ],
}

function getRecsForFactor(f: Factor): Recommendation[] {
  const l = f.label.toLowerCase()
  if (l.includes('duplic')) return FACTOR_RECS.dup
  if (l.includes('missing') || l.includes('identifier')) return FACTOR_RECS.missing
  if (l.includes('unit') || l.includes('lb')) return FACTOR_RECS.unit
  if (l.includes('hillside') || l.includes('cost')) return FACTOR_RECS.cost
  return [{ type: 'investigate', title: `Investigate: ${f.label}`, detail: `Review evidence for this factor. Severity: ${f.severity}.`, effort: f.severity === 'HIGH' ? 'High' : 'Medium' }]
}

const REC_CFG: Record<RecType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  immediate:   { label: 'Immediate',   icon: ArrowRight  },
  monitor:     { label: 'Monitor',     icon: Clock       },
  process:     { label: 'Process',     icon: Wrench      },
  investigate: { label: 'Investigate', icon: TrendingUp  },
}

// ─── Severity ─────────────────────────────────────────────────────────────────

const SEV_STYLE: Record<string, string> = {
  HIGH:   'text-gray-800 bg-gray-100 border-gray-300 font-bold',
  MEDIUM: 'text-gray-600 bg-gray-50  border-gray-200 font-semibold',
  LOW:    'text-gray-400 bg-white    border-gray-200 font-medium',
}
const SEV_BAR: Record<string, string> = {
  HIGH:   'bg-gray-700',
  MEDIUM: 'bg-gray-400',
  LOW:    'bg-gray-300',
}

// ─── Recommendations tab view ─────────────────────────────────────────────────

function RecsView({ recs, onBack }: { recs: Recommendation[]; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="h-9 w-9 rounded-xl bg-[#E8F5EE] flex items-center justify-center shrink-0">
            <Lightbulb className="h-4 w-4 text-[#006837]" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">AI Recommendations</p>
            <p className="text-xs text-gray-400">{recs.length} action{recs.length !== 1 ? 's' : ''} generated</p>
          </div>
        </div>

        {/* Recommendation cards */}
        {recs.map((rec, i) => {
          const cfg = REC_CFG[rec.type]
          return (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <cfg.icon className="h-3.5 w-3.5 text-gray-600" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{cfg.label}</span>
                  <span className="text-xs text-gray-400">Effort: {rec.effort}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-snug">{rec.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{rec.detail}</p>
            </div>
          )
        })}
      </div>

      <div className="shrink-0 border-t border-gray-100 p-3">
        <button onClick={onBack}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-700 transition-colors">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to chat
        </button>
      </div>
    </div>
  )
}

// ─── FactorRow ────────────────────────────────────────────────────────────────

function FactorRow({ factor, selected, onToggle }: { factor: Factor; selected: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2.5 px-4 py-3 hover:bg-gray-50 transition-colors">
        <button
          onClick={onToggle}
          className={cn('h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors',
            selected ? 'bg-[#006837] border-[#006837]' : 'border-gray-300 hover:border-[#006837]'
          )}
        >
          {selected && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
        </button>
        <button className="flex-1 flex items-center justify-between min-w-0 text-left" onClick={() => setOpen(o => !o)}>
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn('w-1 h-5 rounded-full shrink-0', SEV_BAR[factor.severity])} />
            <span className="text-sm font-medium text-gray-900 truncate">{factor.label}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', SEV_STYLE[factor.severity])}>{factor.severity}</span>
            {open ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
          </div>
        </button>
      </div>
      {open && <div className="px-10 pb-3 text-xs text-gray-500 leading-relaxed bg-gray-50/50">{factor.detail}</div>}
    </div>
  )
}

// ─── AnalysisMessage ──────────────────────────────────────────────────────────

function AnalysisMessage({ analysis, onRecsGenerated }: {
  analysis: AnalysisResult
  onRecsGenerated?: (recs: Recommendation[], q: string) => void
}) {
  const [helpful, setHelpful] = useState<boolean | null>(null)
  const [showCalc, setShowCalc] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [generating, setGenerating] = useState(false)

  const toggle = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const generate = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 800))
    const recs: Recommendation[] = []
    analysis.contributing_factors?.forEach(f => { if (selected.has(f.id)) recs.push(...getRecsForFactor(f)) })
    const seen = new Set<string>()
    onRecsGenerated?.(recs.filter(r => { if (seen.has(r.title)) return false; seen.add(r.title); return true }), analysis.answer.slice(0, 60))
    setGenerating(false)
  }

  if (analysis.is_unsupported) return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-1.5">
      <div className="flex items-center gap-2"><HelpCircle className="h-4 w-4 text-amber-600" /><p className="text-sm font-semibold text-amber-800">Outside certified metrics</p></div>
      <p className="text-sm text-amber-700 leading-relaxed">{analysis.answer}</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Main analysis card */}
      <div className="rounded-xl overflow-hidden border border-[#D0EBD9]">
        {/* Card header */}
        <div className="bg-gradient-to-r from-[#006837] to-[#008a43] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-white/90" />
            <span className="text-sm font-bold text-white">AI Analysis</span>
          </div>
          <span className="text-xs font-semibold text-white/80 bg-white/20 px-2.5 py-0.5 rounded-full">
            {analysis.confidence}% confidence
          </span>
        </div>
        {/* Card body */}
        <div className="bg-[#f9fdfb] p-4 space-y-3">
          {analysis.value != null && (
            <div className="flex items-baseline gap-1.5 py-1">
              <span className="text-2xl font-bold tabular-nums text-[#006837]">{analysis.value}</span>
              {analysis.unit && <span className="text-sm text-[#008a43] font-medium">{analysis.unit}</span>}
            </div>
          )}
          <p className="text-sm text-gray-800 leading-relaxed">{analysis.answer}</p>
          {/* Metric badge */}
          {analysis.metric_id && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="font-mono text-xs bg-white border border-[#D0EBD9] text-[#006837] px-2.5 py-0.5 rounded-lg">{analysis.metric_id}</span>
              {analysis.display_name && <span className="text-xs text-gray-500">{analysis.display_name}</span>}
              {analysis.is_certified && (
                <span className="flex items-center gap-1 text-xs text-[#006837] bg-[#E8F5EE] border border-[#D0EBD9] px-2 py-0.5 rounded-lg font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> Certified
                </span>
              )}
            </div>
          )}
          {/* Helpful */}
          <div className="flex items-center gap-3 pt-1 border-t border-[#E8F5EE]">
            <span className="text-xs text-gray-400">Was this helpful?</span>
            <button onClick={() => setHelpful(true)} className={cn('p-1 rounded-lg hover:bg-[#E8F5EE] transition-colors', helpful === true && 'text-[#006837] bg-[#E8F5EE]')}><ThumbsUp className="h-3.5 w-3.5" /></button>
            <button onClick={() => setHelpful(false)} className={cn('p-1 rounded-lg hover:bg-red-50 transition-colors', helpful === false && 'text-red-500 bg-red-50')}><ThumbsDown className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      {/* Contributing factors */}
      {analysis.contributing_factors && analysis.contributing_factors.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Contributing Factors</span>
            <span className="text-xs text-gray-400">Select for recommendations</span>
          </div>
          {analysis.contributing_factors.map(f => (
            <FactorRow key={f.id} factor={f} selected={selected.has(f.id)} onToggle={() => toggle(f.id)} />
          ))}
        </div>
      )}

      {/* Generate button */}
      {analysis.contributing_factors && analysis.contributing_factors.length > 0 && (
        <button
          onClick={generate}
          disabled={selected.size === 0 || generating}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
            selected.size > 0 && !generating
              ? 'bg-gradient-to-r from-[#006837] to-[#008a43] text-white shadow-sm hover:shadow-md hover:from-[#004D28] hover:to-[#006837]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          )}
        >
          {generating
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
            : <><Wand2 className="h-4 w-4" /> Generate AI Recommendations {selected.size > 0 && <span className="bg-white/25 px-1.5 py-0.5 rounded-full text-xs">{selected.size}</span>}</>
          }
        </button>
      )}

      {/* Footnotes */}
      <div className="space-y-1.5 px-1">
        {analysis.data_quality_note && (
          <p className="text-xs text-gray-400 flex items-start gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#006837]" />
            {analysis.data_quality_note}
          </p>
        )}
        {analysis.calculation_note && (
          <div>
            <button className="text-xs text-[#006837] hover:underline flex items-center gap-1" onClick={() => setShowCalc(c => !c)}>
              How was this computed? {showCalc ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            {showCalc && <code className="block mt-1.5 text-xs bg-gray-900 text-green-400 px-3 py-2 rounded-lg font-mono leading-relaxed">{analysis.calculation_note}</code>}
          </div>
        )}
        {analysis.lineage_id && (
          <p className="text-xs text-gray-400 font-mono">
            Lineage: <Link to="/overview" className="text-[#006837] hover:underline inline-flex items-center gap-0.5">
              {analysis.lineage_id}<ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function AiChatPanel() {
  const { isChatPanelOpen, setIsChatPanelOpen } = useAppStore()
  const pendingQuestion   = useAppStore(s => s.pendingQuestion)
  const clearPending      = useAppStore(s => s.clearPendingQuestion)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tabs, setTabs] = useState<Array<{ id: string; label: string; type: 'analysis' | 'recs' }>>([])
  const [activeTab, setActiveTab] = useState<string>('welcome')
  const [recsByTabId, setRecsByTabId] = useState<Record<string, Recommendation[]>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleRecsGenerated = useCallback((recs: Recommendation[], _q: string) => {
    const tabId = `recs-${Date.now()}`
    setTabs(prev => [...prev.slice(-2), { id: tabId, label: `Recs (${recs.length})`, type: 'recs' }])
    setRecsByTabId(prev => ({ ...prev, [tabId]: recs }))
    setActiveTab(tabId)
  }, [])

  useEffect(() => { if (isChatPanelOpen) setTimeout(() => inputRef.current?.focus(), 150) }, [isChatPanelOpen])

  // Consume pending question from store (fired by InlineAskAI suggestion clicks)
  useEffect(() => {
    if (isChatPanelOpen && pendingQuestion) {
      clearPending()
      sendMessage(pendingQuestion)
    }
  }, [isChatPanelOpen, pendingQuestion])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return
    const userMsg: Message = { id: `msg-${Date.now()}`, role: 'user', text: text.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)
    setActiveTab('chat')
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600))
    const analysis = getMockResponse(text.trim())
    const assistantMsg: Message = { id: `msg-${Date.now()}-ai`, role: 'assistant', text: analysis.answer, analysis, timestamp: new Date() }
    setMessages(prev => [...prev, assistantMsg])
    const label = text.length > 24 ? text.slice(0, 22) + '…' : text
    setTabs(prev => { if (prev.find(t => t.label === label)) return prev; return [...prev.slice(-2), { id: assistantMsg.id, label, type: 'analysis' }] })
    setActiveTab(assistantMsg.id)
    setIsLoading(false)
  }, [isLoading])

  const clearChat = () => { setMessages([]); setTabs([]); setRecsByTabId({}); setActiveTab('welcome'); setInputValue('') }
  const isWelcome = messages.length === 0 && !isLoading

  return (
    <>
      {isChatPanelOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setIsChatPanelOpen(false)} aria-hidden />
      )}

      <aside className={cn(
        'fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-white border-l border-gray-200 shadow-2xl',
        'transition-transform duration-300 ease-in-out w-[420px] max-w-[95vw]',
        isChatPanelOpen ? 'translate-x-0' : 'translate-x-full',
      )}>
        {/* ── Decorative header ── */}
        <div className="bg-gradient-to-r from-[#006837] to-[#00a651] shrink-0">
          {/* Brand row */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">Farm One AI</p>
                <p className="text-[10px] text-white/70 leading-tight">Livestock Data Intelligence</p>
              </div>
            </div>
            <button onClick={() => setIsChatPanelOpen(false)}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
              aria-label="Close AI panel">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-0.5 px-2 pb-0">
            {tabs.map(tab => (
              <div key={tab.id} className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-t-lg text-xs font-medium transition-all max-w-[120px] group',
                activeTab === tab.id ? 'bg-white text-[#006837]' : 'text-white/70 hover:text-white hover:bg-white/10',
              )}>
                <button className="flex items-center gap-1 truncate min-w-0" onClick={() => setActiveTab(tab.id)}>
                  {tab.type === 'recs' ? <Lightbulb className="h-3 w-3 shrink-0 text-amber-400" /> : <BarChart2 className="h-3 w-3 shrink-0" />}
                  <span className="truncate max-w-[72px]">{tab.label}</span>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setTabs(p => p.filter(t => t.id !== tab.id)); if (activeTab === tab.id) setActiveTab('welcome') }}
                  className="shrink-0 h-4 w-4 flex items-center justify-center rounded hover:bg-red-400/30 hover:text-white transition-colors"
                  aria-label="Close tab"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}

            {/* Clear / New */}
            {!isWelcome ? (
              <button onClick={clearChat}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-t-lg text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            ) : (
              <button onClick={clearChat}
                className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-t-lg text-xs transition-all',
                  isWelcome ? 'bg-white text-[#006837] font-medium' : 'text-white/70 hover:text-white hover:bg-white/10',
                )}>
                <Plus className="h-3 w-3" /> New Chat
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto">
          {isWelcome ? (
            /* Welcome state */
          <div className="px-5 pt-8 gap-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#E8F5EE] to-[#D0EBD9] flex items-center justify-center mb-3 shadow-sm">
                <Sparkles className="h-6 w-6 text-[#006837]" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">How can I help?</h2>
              <p className="text-xs text-gray-400 leading-relaxed max-w-[280px] mb-4">
                Ask about herd performance, data quality, feed costs, or entity reconciliation.
              </p>

              <div className="w-full space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">Suggested Questions</p>
                {SUGGESTED.map((sq) => (
                  <button key={sq.text}
                    className="w-full flex items-start gap-3 text-left px-3.5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-[#E8F5EE] hover:border-[#D0EBD9] transition-all text-sm text-gray-700 group"
                    onClick={() => sendMessage(sq.text)}>
                    <div className="h-6 w-6 rounded-lg bg-[#E8F5EE] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#006837] transition-colors">
                      <sq.icon className="h-3.5 w-3.5 text-[#006837] group-hover:text-white transition-colors" />
                    </div>
                    {sq.text}
                  </button>
                ))}
              </div>
            </div>
          ) : recsByTabId[activeTab] ? (
            <RecsView recs={recsByTabId[activeTab]} onBack={() => {
              const at = [...tabs].reverse().find(t => t.type === 'analysis')
              setActiveTab(at?.id ?? 'chat')
            }} />
          ) : (
            /* Message thread */
            <div className="p-5 space-y-5">
              {messages.map(msg => (
                <div key={msg.id}>
                  {msg.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-gradient-to-br from-[#006837] to-[#008a43] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed shadow-sm">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {msg.analysis && <AnalysisMessage analysis={msg.analysis} onRecsGenerated={handleRecsGenerated} />}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#006837] to-[#008a43] flex items-center justify-center shrink-0">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="h-2 w-2 rounded-full bg-[#006837] animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-100 p-3 bg-white">
          <form onSubmit={e => { e.preventDefault(); sendMessage(inputValue) }} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask about herd performance, quality or feed costs…"
              className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#006837] focus:ring-2 focus:ring-[#006837]/20 transition-all placeholder:text-gray-400"
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 bg-gradient-to-r from-[#006837] to-[#008a43] text-white hover:from-[#004D28] hover:to-[#006837] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              aria-label="Send"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Ask
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
