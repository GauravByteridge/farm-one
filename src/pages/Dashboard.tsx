/**
 * Dashboard — One Herd, One Truth
 *
 * Hierarchical filter: Country → Region → Farm
 * Selecting "All" at any level aggregates data across all children.
 * KPIs, charts, and cards all react to the current selection.
 */

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell, LineChart, Line,
} from 'recharts'
import {
  Activity, AlertTriangle, CheckCircle2, ArrowRight,
  Milk, Droplets, DollarSign, ShieldCheck, Database,
  TrendingDown, TrendingUp, Minus, Globe, Star,
  Sparkles, ChevronDown, ChevronUp, Layers, Package,
  MapPin, Building2, X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

// ─── Master data: all farms with full metrics ─────────────────────────────────

interface FarmData {
  id: string
  name: string
  country: string
  flag: string
  region: string
  farmType: string
  herdBand: string
  activeCows: number
  milkingCows: number
  totalMilkKg: number
  avgMilkPerCow: number
  feedCostUsd: number
  dqScore: number
  totalRecords: number
  passedRecords: number
  correctedRecords: number
  quarantinedRecords: number
}

const ALL_FARMS: FarmData[] = [
  {
    id: 'FARM-00101', name: 'Green Valley Dairy',
    country: 'United Kingdom', flag: '🇬🇧', region: 'North',
    farmType: 'dairy', herdBand: 'large',
    activeCows: 412, milkingCows: 380,
    totalMilkKg: 11_334, avgMilkPerCow: 29.8,
    feedCostUsd: 0.296, dqScore: 96.2,
    totalRecords: 1280, passedRecords: 1205, correctedRecords: 48, quarantinedRecords: 27,
  },
  {
    id: 'FARM-00142', name: 'Sunrise Farm',
    country: 'United Kingdom', flag: '🇬🇧', region: 'North',
    farmType: 'dairy', herdBand: 'medium',
    activeCows: 298, milkingCows: 265,
    totalMilkKg: 8_613, avgMilkPerCow: 28.4,
    feedCostUsd: 0.318, dqScore: 91.4,
    totalRecords: 940, passedRecords: 860, correctedRecords: 52, quarantinedRecords: 28,
  },
  {
    id: 'FARM-00203', name: 'Hillside Ranch',
    country: 'Ireland', flag: '🇮🇪', region: 'South',
    farmType: 'beef', herdBand: 'small',
    activeCows: 178, milkingCows: 142,
    totalMilkKg: 4_250, avgMilkPerCow: 22.1,
    feedCostUsd: 0.392, dqScore: 88.7,
    totalRecords: 560, passedRecords: 490, correctedRecords: 28, quarantinedRecords: 42,
  },
  {
    id: 'FARM-00267', name: 'Valley View Farm',
    country: 'Netherlands', flag: '🇳🇱', region: 'East',
    farmType: 'dairy', herdBand: 'large',
    activeCows: 476, milkingCows: 451,
    totalMilkKg: 14_071, avgMilkPerCow: 31.2,
    feedCostUsd: 0.251, dqScore: 97.1,
    totalRecords: 1490, passedRecords: 1448, correctedRecords: 28, quarantinedRecords: 14,
  },
  {
    id: 'FARM-00312', name: 'Blue Ridge Farm',
    country: 'New Zealand', flag: '🇳🇿', region: 'West',
    farmType: 'dairy', herdBand: 'medium',
    activeCows: 478, milkingCows: 446,
    totalMilkKg: 13_114, avgMilkPerCow: 27.6,
    feedCostUsd: 0.301, dqScore: 93.5,
    totalRecords: 1490, passedRecords: 1392, correctedRecords: 62, quarantinedRecords: 36,
  },
]

// ─── Filter helpers ───────────────────────────────────────────────────────────

const COUNTRIES = ['All', ...Array.from(new Set(ALL_FARMS.map((f) => f.country)))]

function getRegions(country: string) {
  const farms = country === 'All' ? ALL_FARMS : ALL_FARMS.filter((f) => f.country === country)
  return ['All', ...Array.from(new Set(farms.map((f) => f.region)))]
}

function getFarms(country: string, region: string) {
  let farms = ALL_FARMS
  if (country !== 'All') farms = farms.filter((f) => f.country === country)
  if (region !== 'All') farms = farms.filter((f) => f.region === region)
  return farms
}

// Weighted-average aggregation
function aggregate(farms: FarmData[]) {
  if (farms.length === 0) return null
  const totalCows = farms.reduce((s, f) => s + f.activeCows, 0)
  const totalMilkingCows = farms.reduce((s, f) => s + f.milkingCows, 0)
  const totalMilkKg = farms.reduce((s, f) => s + f.totalMilkKg, 0)
  const totalRecords = farms.reduce((s, f) => s + f.totalRecords, 0)
  const totalPassed = farms.reduce((s, f) => s + f.passedRecords, 0)
  const totalCorrected = farms.reduce((s, f) => s + f.correctedRecords, 0)
  const totalQuarantined = farms.reduce((s, f) => s + f.quarantinedRecords, 0)
  const avgMilk = totalMilkKg / totalMilkingCows
  const avgFeedCost = farms.reduce((s, f) => s + f.feedCostUsd * f.totalMilkKg, 0) / totalMilkKg
  const avgDq = farms.reduce((s, f) => s + f.dqScore * f.totalRecords, 0) / totalRecords
  return {
    activeCows: totalCows,
    milkingCows: totalMilkingCows,
    totalMilkKg,
    avgMilkPerCow: avgMilk,
    feedCostUsd: avgFeedCost,
    dqScore: avgDq,
    totalRecords,
    passedRecords: totalPassed,
    correctedRecords: totalCorrected,
    quarantinedRecords: totalQuarantined,
    farmCount: farms.length,
  }
}

// 30-day simulated trend per farm
function generateTrend(base: number, days = 30) {
  return Array.from({ length: days }, (_, i) => ({
    day: `Jun ${String(i + 1).padStart(2, '0')}`,
    value: parseFloat((base + Math.sin(i * 0.3) * base * 0.04 + (Math.random() - 0.5) * base * 0.02).toFixed(2)),
  }))
}

// ─── Small components ─────────────────────────────────────────────────────────

function TrendIcon({ t }: { t: 'up' | 'down' | 'flat' }) {
  if (t === 'up') return <TrendingUp className="h-3.5 w-3.5" />
  if (t === 'down') return <TrendingDown className="h-3.5 w-3.5" />
  return <Minus className="h-3.5 w-3.5" />
}

interface KpiProps {
  label: string; value: string; unit?: string
  trend: 'up' | 'down' | 'flat'; sub: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string; iconColor: string
}
function KpiCard({ label, value, unit, trend, sub, icon: Icon, iconBg, iconColor }: KpiProps) {
  const tc = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground leading-tight max-w-[80%]">{label}</p>
        <div className={cn('rounded-lg p-2 shrink-0', iconBg)}>
          <Icon className={cn('h-4 w-4', iconColor)} aria-hidden />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      <div className={cn('flex items-center gap-1 text-xs font-medium', tc)}>
        <TrendIcon t={trend} /><span>{sub}</span>
      </div>
    </Card>
  )
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

interface FilterBarProps {
  country: string; region: string; farm: string
  setCountry: (v: string) => void
  setRegion: (v: string) => void
  setFarm: (v: string) => void
  filteredFarms: FarmData[]
}

function FilterBar({ country, region, farm, setCountry, setRegion, setFarm, filteredFarms }: FilterBarProps) {
  const regions = getRegions(country)
  const farmOptions = getFarms(country, region)
  const selectedFarmObj = filteredFarms.find((f) => f.id === farm)

  const scopeLabel = [
    country !== 'All' && country,
    region !== 'All' && region,
    selectedFarmObj?.name,
  ].filter(Boolean).join(' › ') || 'Global — All Countries'

  return (
    <div className="bg-white border border-muted rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="h-4 w-4 text-forest-700" />
        <p className="text-sm font-semibold text-foreground">Filter scope</p>
        <Badge variant="outline" className="text-xs font-mono ml-auto">
          {filteredFarms.length} farm{filteredFarms.length !== 1 ? 's' : ''} in scope
        </Badge>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Country */}
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-1">
            {COUNTRIES.map((c) => {
              const flag = ALL_FARMS.find((f) => f.country === c)?.flag ?? ''
              return (
                <button
                  key={c}
                  onClick={() => { setCountry(c); setRegion('All'); setFarm('All') }}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                    country === c
                      ? 'bg-forest-700 text-white border-forest-700 shadow-sm'
                      : 'bg-muted/50 text-muted-foreground border-transparent hover:border-muted hover:text-foreground',
                  )}
                >
                  {flag && <span>{flag}</span>}
                  {c === 'All' ? 'All Countries' : c}
                </button>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-muted shrink-0" />

        {/* Region */}
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-1">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => { setRegion(r); setFarm('All') }}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                  region === r
                    ? 'bg-forest-100 text-forest-800 border-forest-300'
                    : 'bg-muted/50 text-muted-foreground border-transparent hover:border-muted hover:text-foreground',
                )}
              >
                {r === 'All' ? 'All Regions' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-muted shrink-0" />

        {/* Farm */}
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Select
            value={farm}
            onValueChange={setFarm}
          >
            <SelectTrigger className="h-7 text-xs w-44 border-muted">
              <SelectValue placeholder="All Farms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Farms</SelectItem>
              {farmOptions.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.flag} {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Breadcrumb + clear */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-muted">
        <span className="text-xs text-muted-foreground">Viewing:</span>
        <span className="text-xs font-semibold text-forest-700">{scopeLabel}</span>

        {(country !== 'All' || region !== 'All' || farm !== 'All') && (
          <button
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
            onClick={() => { setCountry('All'); setRegion('All'); setFarm('All') }}
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Pipeline flow (always global) ───────────────────────────────────────────

const PIPELINE_STAGES = [
  {
    id: 'source', label: 'Source Systems', icon: Package,
    color: 'border-blue-300 bg-blue-50', iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700', badgeText: '3 sources',
    total: '35,000 rows', status: 'ok',
    stats: [
      { label: 'Source A (AgriTrack)', value: '12,480 rows' },
      { label: 'Source B (FarmCore)', value: '11,340 rows' },
      { label: 'Source C (HerdVision)', value: '11,180 rows' },
    ],
  },
  {
    id: 'bronze', label: 'Bronze Layer', icon: Database,
    color: 'border-orange-300 bg-orange-50', iconColor: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-700', badgeText: '✓ OK',
    total: '35,000 rows', status: 'ok',
    stats: [
      { label: 'Records preserved', value: '35,000' },
      { label: 'Partitions written', value: '12' },
      { label: 'Schema versions tracked', value: '3' },
    ],
  },
  {
    id: 'silver', label: 'Silver Layer', icon: Layers,
    color: 'border-slate-300 bg-slate-50', iconColor: 'text-slate-600',
    badge: 'bg-amber-100 text-amber-700', badgeText: '⚠ 782 quarantined',
    total: '34,218 valid', status: 'warn',
    stats: [
      { label: 'Passed (clean)', value: '33,042' },
      { label: 'Auto-corrected', value: '1,176' },
      { label: 'Quarantined', value: '782' },
    ],
  },
  {
    id: 'gold', label: 'Gold Layer', icon: Star,
    color: 'border-yellow-300 bg-yellow-50', iconColor: 'text-yellow-600',
    badge: 'bg-yellow-100 text-yellow-700', badgeText: '✓ OK',
    total: '8 metrics ready', status: 'ok',
    stats: [
      { label: 'Trusted records', value: '34,218' },
      { label: 'Canonical entities', value: '3,835' },
      { label: 'Certified metrics', value: '8' },
    ],
  },
]

function PipelineFlowCard() {
  const [expanded, setExpanded] = useState<string | null>(null)
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-forest-700" />
            Complete Data Flow
          </CardTitle>
          <Link to="/pipeline" className="text-xs text-forest-700 hover:underline flex items-center gap-1">
            Pipeline details <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          35,000 source records → 34,218 trusted → 8 certified metrics · Run RUN-2024-002
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2 overflow-x-auto pb-1">
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage.id} className="flex items-start gap-2 shrink-0">
              <button
                className={cn(
                  'rounded-xl border-2 p-3 text-left w-40 transition-all hover:shadow-md',
                  stage.color,
                )}
                onClick={() => setExpanded(expanded === stage.id ? null : stage.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <stage.icon className={cn('h-4 w-4', stage.iconColor)} />
                  <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded leading-tight', stage.badge)}>
                    {stage.badgeText}
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground mb-1">{stage.label}</p>
                <p className="text-sm font-bold text-foreground">{stage.total}</p>
                {expanded === stage.id
                  ? <ChevronUp className="h-3 w-3 text-muted-foreground mt-1.5" />
                  : <ChevronDown className="h-3 w-3 text-muted-foreground mt-1.5" />}
              </button>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className="flex items-center h-14 mt-3">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center h-14 mt-3 shrink-0">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="rounded-xl border-2 border-forest-300 bg-forest-50 p-3 w-40 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="h-4 w-4 text-forest-700" />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-forest-100 text-forest-700">
                ✓ Certified
              </span>
            </div>
            <p className="text-xs font-semibold text-forest-800 mb-1">Metrics Layer</p>
            <p className="text-sm font-bold text-forest-900">8 metrics</p>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 rounded-lg bg-muted/40 border border-muted p-3">
            {PIPELINE_STAGES.find((s) => s.id === expanded)?.stats.map((stat) => (
              <div key={stat.label} className="flex justify-between text-xs py-1 border-b border-muted last:border-0">
                <span className="text-muted-foreground">{stat.label}</span>
                <span className="font-semibold tabular-nums">{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Records through pipeline</span>
            <span className="tabular-nums">34,218 / 35,000 (97.8%)</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden flex">
            <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: '94.4%' }} />
            <div className="h-full bg-amber-400" style={{ width: '3.4%' }} />
            <div className="h-full bg-red-400 rounded-r-full" style={{ width: '2.2%' }} />
          </div>
          <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />Passed 94.4%</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />Corrected 3.4%</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400 inline-block" />Quarantined 2.2%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const COUNTRY_COLORS: Record<string, string> = {
  'United Kingdom': '#1a4d2e',
  'Ireland': '#16a34a',
  'Netherlands': '#3b82f6',
  'New Zealand': '#8b5cf6',
}

export default function Dashboard() {
  const { toggleChatPanel } = useAppStore()

  // ── Filter state ──
  const [country, setCountry] = useState('All')
  const [region, setRegion] = useState('All')
  const [farm, setFarm] = useState('All')

  // ── Derived: farms matching filter ──
  const filteredFarms = useMemo(() => {
    let f = ALL_FARMS
    if (country !== 'All') f = f.filter((x) => x.country === country)
    if (region !== 'All') f = f.filter((x) => x.region === region)
    if (farm !== 'All') f = f.filter((x) => x.id === farm)
    return f
  }, [country, region, farm])

  const agg = useMemo(() => aggregate(filteredFarms), [filteredFarms])

  // ── Trend data for selected scope ──
  const trendData = useMemo(() => {
    if (!agg) return []
    return generateTrend(agg.avgMilkPerCow)
  }, [agg])

  // ── Chart data ──
  const farmBarData = filteredFarms.map((f) => ({
    farm: f.name.replace(' Farm', '').replace(' Dairy', '').replace(' Ranch', ''),
    milk_kg: f.totalMilkKg,
    fill: COUNTRY_COLORS[f.country] ?? '#3d8b5e',
  }))

  const dqData = filteredFarms.map((f) => ({
    name: f.name.split(' ')[0],
    passed: parseFloat(((f.passedRecords / f.totalRecords) * 100).toFixed(1)),
    corrected: parseFloat(((f.correctedRecords / f.totalRecords) * 100).toFixed(1)),
    quarantined: parseFloat(((f.quarantinedRecords / f.totalRecords) * 100).toFixed(1)),
  }))

  // Grouped bar: country comparison (only when scope is All)
  const countryBarData = useMemo(() => {
    return COUNTRIES.filter((c) => c !== 'All').map((c) => {
      const farms = ALL_FARMS.filter((f) => f.country === c)
      const a = aggregate(farms)!
      return {
        country: c.replace('United Kingdom', 'UK').replace('New Zealand', 'NZ'),
        flag: farms[0]?.flag ?? '',
        cows: a.milkingCows,
        milk: parseFloat((a.totalMilkKg / 1000).toFixed(1)),
        cost: parseFloat(a.feedCostUsd.toFixed(3)),
        dq: parseFloat(a.dqScore.toFixed(1)),
      }
    })
  }, [])

  if (!agg) return null

  const isGlobal = country === 'All' && region === 'All' && farm === 'All'
  const isSingleFarm = farm !== 'All'
  const selectedFarmObj = ALL_FARMS.find((f) => f.id === farm)

  return (
    <div className="flex flex-col gap-6 p-6 max-w-screen-2xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">One Herd, One Truth</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Meadowbrook Group · Livestock Data Intelligence · Run: <span className="font-mono text-xs">RUN-2024-002</span> · Jun 15, 2024
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-amber-700 border-amber-400 bg-amber-50 gap-1">
            <AlertTriangle className="h-3 w-3" />
            POC — Synthetic Data Only
          </Badge>
          <button
            onClick={toggleChatPanel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-700 text-white text-xs font-semibold hover:bg-forest-800 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ask AI
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <FilterBar
        country={country} region={region} farm={farm}
        setCountry={setCountry} setRegion={setRegion} setFarm={setFarm}
        filteredFarms={filteredFarms}
      />

      {/* ── KPI strip — reactive to filter ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Active Milking Cows"
          value={agg.milkingCows.toLocaleString()} unit="cows"
          trend="up" sub={isGlobal ? '+3.2% vs last run' : `${filteredFarms.length} farm${filteredFarms.length > 1 ? 's' : ''} in scope`}
          icon={Milk} iconBg="bg-forest-100" iconColor="text-forest-700"
        />
        <KpiCard
          label="Avg Milk / Cow / Day"
          value={agg.avgMilkPerCow.toFixed(1)} unit="kg"
          trend="up" sub={isGlobal ? '+1.1 kg vs last run' : `Weighted avg across scope`}
          icon={Droplets} iconBg="bg-blue-50" iconColor="text-blue-600"
        />
        <KpiCard
          label="Feed Cost / kg Milk"
          value={`$${agg.feedCostUsd.toFixed(3)}`} unit="USD/kg"
          trend={agg.feedCostUsd > 0.307 ? 'down' : 'up'}
          sub={agg.feedCostUsd > 0.307 ? `$${(agg.feedCostUsd - 0.307).toFixed(3)} above avg` : `$${(0.307 - agg.feedCostUsd).toFixed(3)} below avg`}
          icon={DollarSign} iconBg="bg-amber-50" iconColor="text-amber-600"
        />
        <KpiCard
          label="Data Quality Score"
          value={`${agg.dqScore.toFixed(1)}%`}
          trend={agg.dqScore >= 94 ? 'up' : 'down'}
          sub={`${agg.quarantinedRecords.toLocaleString()} records quarantined`}
          icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600"
        />
        <KpiCard
          label={isSingleFarm ? 'Farm Type' : 'Countries / Farms'}
          value={isSingleFarm
            ? (selectedFarmObj?.farmType ?? '—')
            : `${isGlobal ? COUNTRIES.length - 1 : new Set(filteredFarms.map((f) => f.country)).size} / ${filteredFarms.length}`}
          trend="flat"
          sub={isSingleFarm ? selectedFarmObj?.herdBand + ' herd' : `${agg.totalRecords.toLocaleString()} total records`}
          icon={Database} iconBg="bg-violet-50" iconColor="text-violet-600"
        />
      </div>

      {/* ── Pipeline flow (always global) ── */}
      <PipelineFlowCard />

      {/* ── Country comparison charts (only when Global) ── */}
      {isGlobal && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Milking Cows by Country</CardTitle>
              <p className="text-xs text-muted-foreground">Active milking cows · Gold layer</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={countryBarData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="country" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Milking cows']}
                    contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  <Bar dataKey="cows" radius={[4, 4, 0, 0]} name="Milking Cows">
                    {countryBarData.map((entry) => (
                      <Cell key={entry.country}
                        fill={COUNTRY_COLORS[entry.country === 'UK' ? 'United Kingdom' : entry.country === 'NZ' ? 'New Zealand' : entry.country] ?? '#3d8b5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Feed Cost / kg by Country</CardTitle>
              <p className="text-xs text-muted-foreground">USD/kg · Red = above $0.307 cohort avg</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={countryBarData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="country" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `$${v.toFixed(2)}`} domain={[0.2, 0.45]} />
                  <Tooltip formatter={(v: number) => [`$${(v as number).toFixed(3)}/kg`, 'Feed cost']}
                    contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  <Bar dataKey="cost" radius={[4, 4, 0, 0]} name="Cost/kg">
                    {countryBarData.map((d) => (
                      <Cell key={d.country} fill={d.cost > 0.307 ? '#ef4444' : '#16a34a'} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Farm / Region charts — reactive ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Production chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Milk Production {isSingleFarm ? '— 30-Day Trend' : 'by Farm'}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {isSingleFarm ? 'kg/cow/day · Jun 2024' : 'Total kg · Gold layer'}
            </p>
          </CardHeader>
          <CardContent>
            {isSingleFarm ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7280' }} interval={5}
                    axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${v}kg`} />
                  <Tooltip formatter={(v: number) => [`${(v as number).toFixed(1)} kg`, 'Avg milk/cow']}
                    contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  <Line dataKey="value" stroke="#1a4d2e" strokeWidth={2} dot={false}
                    name="Avg milk/cow/day" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={farmBarData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="farm" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} kg`, 'Milk']}
                    contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  <Bar dataKey="milk_kg" radius={[4, 4, 0, 0]}>
                    {farmBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* DQ chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Data Quality by Farm</CardTitle>
            <p className="text-xs text-muted-foreground">% of records in scope</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dqData} layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name"
                  tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }}
                  axisLine={false} tickLine={false} width={72} />
                <Tooltip formatter={(v: number, n: string) => [
                  `${(v as number).toFixed(1)}%`, n.charAt(0).toUpperCase() + n.slice(1),
                ]} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v.charAt(0).toUpperCase() + v.slice(1)}</span>} />
                <Bar dataKey="passed" stackId="a" fill="#16a34a" name="passed" />
                <Bar dataKey="corrected" stackId="a" fill="#f59e0b" name="corrected" />
                <Bar dataKey="quarantined" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} name="quarantined" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Country / Farm comparison table (when scoped) ── */}
      {!isGlobal && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-forest-700" />
              Farm Detail — {country !== 'All' ? country : ''} {region !== 'All' ? `· ${region}` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    {['Farm', 'Country', 'Region', 'Milking Cows', 'Avg Milk/Cow', 'Feed Cost/kg', 'DQ Score', 'Quarantined'].map((h) => (
                      <th key={h} className="text-left pb-2 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredFarms.map((f) => (
                    <tr key={f.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2 pr-4 font-medium">{f.name}</td>
                      <td className="py-2 pr-4">{f.flag} {f.country}</td>
                      <td className="py-2 pr-4">{f.region}</td>
                      <td className="py-2 pr-4 tabular-nums font-semibold">{f.milkingCows.toLocaleString()}</td>
                      <td className="py-2 pr-4 tabular-nums">{f.avgMilkPerCow.toFixed(1)} kg</td>
                      <td className={cn('py-2 pr-4 tabular-nums font-semibold',
                        f.feedCostUsd > 0.307 ? 'text-red-600' : 'text-emerald-600')}>
                        ${f.feedCostUsd.toFixed(3)}
                      </td>
                      <td className={cn('py-2 pr-4 tabular-nums font-semibold',
                        f.dqScore >= 95 ? 'text-emerald-600' : f.dqScore >= 90 ? 'text-amber-600' : 'text-red-500')}>
                        {f.dqScore.toFixed(1)}%
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-red-500">{f.quarantinedRecords}</td>
                    </tr>
                  ))}
                  {/* Aggregate row */}
                  <tr className="bg-forest-50 font-semibold border-t-2 border-forest-200">
                    <td className="py-2 pr-4 text-forest-800">Total / Avg</td>
                    <td className="py-2 pr-4 text-forest-700">
                      {new Set(filteredFarms.map((f) => f.country)).size} countries
                    </td>
                    <td className="py-2 pr-4 text-forest-700">
                      {new Set(filteredFarms.map((f) => f.region)).size} regions
                    </td>
                    <td className="py-2 pr-4 tabular-nums text-forest-900">{agg.milkingCows.toLocaleString()}</td>
                    <td className="py-2 pr-4 tabular-nums text-forest-900">{agg.avgMilkPerCow.toFixed(1)} kg</td>
                    <td className={cn('py-2 pr-4 tabular-nums', agg.feedCostUsd > 0.307 ? 'text-red-600' : 'text-emerald-600')}>
                      ${agg.feedCostUsd.toFixed(3)}
                    </td>
                    <td className="py-2 pr-4 tabular-nums text-forest-900">{agg.dqScore.toFixed(1)}%</td>
                    <td className="py-2 pr-4 tabular-nums text-red-600">{agg.quarantinedRecords}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Source disagreement (global only) ── */}
      {isGlobal && (
        <Card className="border-l-4 border-l-amber-400">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Source Disagreement
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Why three systems give three different counts — before reconciliation
                </p>
              </div>
              <Link to="/compare" className="flex items-center gap-1 text-xs text-forest-700 hover:underline font-medium">
                Full view <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { label: 'Source A · AgriTrack', cows: 1920, milk: '31.2 kg', note: '', color: 'border-l-blue-400 bg-blue-50' },
                { label: 'Source B · FarmCore', cows: 1674, milk: '24.8 lbs ⚠', note: 'Lbs → kg auto-corrected', color: 'border-l-amber-400 bg-amber-50' },
                { label: 'Source C · HerdVision', cows: 1901, milk: '29.1 kg', note: '', color: 'border-l-violet-400 bg-violet-50' },
                { label: '✓ Gold (Reconciled)', cows: 1842, milk: '28.4 kg', note: '97 duplicates resolved', color: 'border-l-forest-400 bg-forest-50' },
              ].map((s) => (
                <div key={s.label} className={cn('rounded-lg border-l-2 p-3', s.color)}>
                  <p className="text-xs font-semibold text-foreground mb-2">{s.label}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Active cows</p>
                      <p className="font-bold tabular-nums">{s.cows.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg milk</p>
                      <p className="font-bold">{s.milk}</p>
                    </div>
                  </div>
                  {s.note && <p className="text-[10px] text-amber-700 mt-1.5">{s.note}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
