/**
 * FilterBar
 *
 * Layout:
 *  [Country ▾] [Region ▾] [Farm ▾]  |  vs  |  [Country ▾] [Region ▾] [Farm ▾]  |  [Compare] [Period]
 *   ← Primary scope                             ← Comparison scope                  ← Options
 *
 * The "vs" separator lets users compare any country/region/farm against any other.
 * "Same as primary" toggle locks the comparison scope to mirror the primary scope
 * (so you compare the same geography over different time periods).
 */

import { useAppStore } from '@/stores/appStore'
import type { ComparisonStandard, DateRange, ScopeFilters } from '@/stores/appStore'
import { SlidersHorizontal, ArrowLeftRight, Link, Unlink, X } from 'lucide-react'

// ─── Master farm/geography data ───────────────────────────────────────────────

export const FARM_MASTER = [
  { id: 'FARM-00101', name: 'Green Valley Dairy',   region: 'North',      country: 'United Kingdom', flag: '🇬🇧' },
  { id: 'FARM-00142', name: 'Sunrise Farm',          region: 'North',      country: 'United Kingdom', flag: '🇬🇧' },
  { id: 'FARM-00203', name: 'Hillside Ranch',        region: 'South',      country: 'Ireland',        flag: '🇮🇪' },
  { id: 'FARM-00267', name: 'Valley View Farm',      region: 'East',       country: 'Netherlands',    flag: '🇳🇱' },
  { id: 'FARM-00312', name: 'Blue Ridge Farm',       region: 'West',       country: 'New Zealand',    flag: '🇳🇿' },
  { id: 'FARM-00401', name: 'Meadow Brook Estate',   region: 'Midlands',   country: 'United Kingdom', flag: '🇬🇧' },
  { id: 'FARM-00402', name: 'Shannon Valley Farm',   region: 'West',       country: 'Ireland',        flag: '🇮🇪' },
  { id: 'FARM-00403', name: 'De Waard Hoeve',        region: 'North',      country: 'Netherlands',    flag: '🇳🇱' },
  { id: 'FARM-00404', name: 'Waikato Grasslands',    region: 'South',      country: 'New Zealand',    flag: '🇳🇿' },
  { id: 'FARM-00405', name: 'Perthshire Cattle Co.', region: 'Scotland',   country: 'United Kingdom', flag: '🇬🇧' },
  { id: 'FARM-00406', name: 'Munster Organics',      region: 'South',      country: 'Ireland',        flag: '🇮🇪' },
  { id: 'FARM-00407', name: 'Frisian Pride Farm',    region: 'South',      country: 'Netherlands',    flag: '🇳🇱' },
  { id: 'FARM-00408', name: 'Canterbury Plains',     region: 'Canterbury', country: 'New Zealand',    flag: '🇳🇿' },
]

export const ALL_COUNTRIES = [...new Set(FARM_MASTER.map(f => f.country))]

export function getRegionsForCountry(country: string) {
  return [...new Set(
    FARM_MASTER.filter(f => !country || f.country === country).map(f => f.region)
  )]
}

export function getFarmsForScope(scope: ScopeFilters) {
  return FARM_MASTER.filter(f => {
    if (scope.country && f.country !== scope.country) return false
    if (scope.region  && f.region  !== scope.region)  return false
    if (scope.farmId  && f.id      !== scope.farmId)   return false
    return true
  })
}

export function getScopeScale(scope: ScopeFilters) {
  return getFarmsForScope(scope).length / FARM_MASTER.length
}

const COMPARISONS: { value: ComparisonStandard; label: string }[] = [
  { value: 'vs_last_run',        label: 'vs Last Run'        },
  { value: 'vs_cohort',          label: 'vs Cohort Average'  },
  { value: 'vs_industry',        label: 'vs Industry Avg'    },
  { value: 'vs_previous_period', label: 'vs Previous Period' },
]

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: '30d', label: 'Last 30 days'   },
  { value: '3m',  label: 'Last 3 months'  },
  { value: '12m', label: 'Last 12 months' },
  { value: '2y',  label: 'Last 2 years'   },
  { value: '3y',  label: 'Last 3 years'   },
  { value: '5y',  label: 'Last 5 years'   },
  { value: 'all', label: 'All time'       },
]

// ─── Reusable scope selector ──────────────────────────────────────────────────

function ScopeSelectors({
  scope,
  onCountry,
  onRegion,
  onFarm,
  label,
  color,
}: {
  scope: ScopeFilters
  onCountry: (v: string) => void
  onRegion:  (v: string) => void
  onFarm:    (v: string) => void
  label: string
  color: string  // css class for label
}) {
  const regions = getRegionsForCountry(scope.country)
  const farms   = getFarmsForScope({ ...scope, farmId: '' })

  const sel = (value: string, onChange: (v: string) => void, opts: React.ReactNode) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#006837] hover:border-gray-300 cursor-pointer transition-colors"
      style={{ minWidth: 108 }}
    >
      {opts}
    </select>
  )

  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-[10px] font-semibold uppercase tracking-wide ${color} whitespace-nowrap`}>{label}</span>
      {sel(scope.country, onCountry,
        <>
          <option value="">All Countries</option>
          {ALL_COUNTRIES.map(c => {
            const f = FARM_MASTER.find(x => x.country === c)
            return <option key={c} value={c}>{f?.flag} {c}</option>
          })}
        </>
      )}
      {sel(scope.region, onRegion,
        <>
          <option value="">All Regions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </>
      )}
      {sel(scope.farmId, onFarm,
        <>
          <option value="">All Farms</option>
          {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </>
      )}
    </div>
  )
}

// ─── Main FilterBar ───────────────────────────────────────────────────────────

export function FilterBar() {
  const {
    primary, setPrimary,
    vsScope, setVsScope,
    vsSameAsPrimary, setVsSameAsPrimary,
    comparison, setComparison,
    dateRange, setDateRange,
    resetFilters,
  } = useAppStore()

  const hasFilter = !!(primary.country || primary.region || primary.farmId || vsScope.country || vsScope.region || vsScope.farmId)

  return (
    <div className="flex items-center gap-2.5 px-5 py-2 bg-white border-b border-gray-100 shrink-0 flex-wrap min-h-[44px]">
      {/* Icon */}
      <div className="flex items-center gap-1.5 shrink-0 text-gray-400">
        <SlidersHorizontal className="h-3.5 w-3.5" />
      </div>

      {/* Primary scope */}
      <ScopeSelectors
        scope={primary}
        onCountry={v => setPrimary({ country: v })}
        onRegion={v  => setPrimary({ region: v })}
        onFarm={v    => setPrimary({ farmId: v })}
        label="View"
        color="text-[#006837]"
      />

      {/* vs separator with link/unlink toggle */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="h-px w-3 bg-gray-300" />
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-full px-2 py-0.5">
          <ArrowLeftRight className="h-3 w-3 text-gray-500" />
          <span className="text-[11px] font-semibold text-gray-500">vs</span>
        </div>
        <div className="h-px w-3 bg-gray-300" />

        {/* Lock / unlock comparison scope */}
        <button
          onClick={() => setVsSameAsPrimary(!vsSameAsPrimary)}
          title={vsSameAsPrimary ? 'Comparison mirrors primary — click to customise' : 'Click to lock to same scope as primary'}
          className={`p-1 rounded-md transition-colors ${vsSameAsPrimary ? 'text-[#006837] bg-[#E8F5EE]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
        >
          {vsSameAsPrimary ? <Link className="h-3.5 w-3.5" /> : <Unlink className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Comparison scope — shows custom selectors when unlocked */}
      {vsSameAsPrimary ? (
        <span className="text-xs text-gray-400 italic">Same geography</span>
      ) : (
        <ScopeSelectors
          scope={vsScope}
          onCountry={v => setVsScope({ country: v })}
          onRegion={v  => setVsScope({ region: v })}
          onFarm={v    => setVsScope({ farmId: v })}
          label="Compare"
          color="text-gray-500"
        />
      )}

      {/* Divider */}
      <div className="h-4 w-px bg-gray-200 shrink-0 ml-1" />

      {/* Comparison type */}
      <select
        value={comparison}
        onChange={e => setComparison(e.target.value as ComparisonStandard)}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#006837] hover:border-gray-300 cursor-pointer"
        style={{ minWidth: 140 }}
      >
        {COMPARISONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>

      {/* Period */}
      <select
        value={dateRange}
        onChange={e => setDateRange(e.target.value as DateRange)}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#006837] hover:border-gray-300 cursor-pointer"
        style={{ minWidth: 110 }}
      >
        {DATE_RANGES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
      </select>

      {/* Clear */}
      {hasFilter && (
        <button
          onClick={resetFilters}
          className="ml-auto flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 transition-colors"
        >
          <X className="h-3 w-3" /> Clear filters
        </button>
      )}
    </div>
  )
}
