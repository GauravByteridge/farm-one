import { GitMerge } from 'lucide-react'

type ConfidenceLevel = 'High' | 'Medium' | 'Low'

interface CorrelationRow {
  sourceA: string
  sourceB: string
  matchFactors: string
  confidence: string
  status: ConfidenceLevel
}

const CORRELATION_ROWS: CorrelationRow[] = [
  {
    sourceA: 'farms.MAD-001 → Meadowbrook Dairy',
    sourceB: 'farms.345 → Meadowbrook Farm',
    matchFactors: 'Name fuzzy 94% · Location match',
    confidence: '97%',
    status: 'High',
  },
  {
    sourceA: 'farms.CHI-002 → Chiltern Hill Farm',
    sourceB: 'farms.346 → Chiltern Hills',
    matchFactors: 'Name fuzzy 88% · County match',
    confidence: '91%',
    status: 'High',
  },
  {
    sourceA: 'farms.GVD-003 → Green Valley Dairy',
    sourceB: 'farms.347 → Green Valley',
    matchFactors: 'Name fuzzy 92% · Postcode match',
    confidence: '94%',
    status: 'High',
  },
  {
    sourceA: 'farms.SUN-004 → Sunrise Farm',
    sourceB: 'farms.348 → Sunrise Agricultural',
    matchFactors: 'Name fuzzy 79% · Region match',
    confidence: '82%',
    status: 'Medium',
  },
  {
    sourceA: 'farms.HRS-005 → Hillside Ranch',
    sourceB: 'farms.349 → Hillside Cattle Co.',
    matchFactors: 'Name fuzzy 71% · No location',
    confidence: '68%',
    status: 'Medium',
  },
  {
    sourceA: 'cows.TAG-2019-001',
    sourceB: 'animals.BESSIE-2019',
    matchFactors: 'Name extract · Birth year match',
    confidence: '89%',
    status: 'High',
  },
  {
    sourceA: 'cows.TAG-2020-042',
    sourceB: 'animals.DAISY-2020',
    matchFactors: 'Name extract · Birth year match',
    confidence: '85%',
    status: 'High',
  },
  {
    sourceA: 'cows.TAG-2021-117',
    sourceB: 'animals.CLOVER-2021',
    matchFactors: 'Name extract · Farm confirmed',
    confidence: '48%',
    status: 'Low',
  },
]

function confidenceBadge(level: ConfidenceLevel) {
  if (level === 'High')   return 'bg-[#E8F5EE] text-[#006837] px-2 py-0.5 rounded-full text-xs font-semibold'
  if (level === 'Medium') return 'bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold'
  return 'bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold'
}

export default function AdminCorrelation() {
  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Cross-System Correlation</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          AI matches entities across systems with confidence scores
        </p>
      </div>

      {/* Time-saved banner */}
      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-green-50 p-4 flex items-center gap-4">
        <div className="flex-1 bg-amber-100 text-amber-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-0.5">Manual Effort</p>
          <p className="text-lg font-bold">4–8 weeks</p>
          <p className="text-xs text-amber-700">Manual entity matching across all source systems</p>
        </div>
        <div className="text-gray-400 font-bold text-xl shrink-0">→</div>
        <div className="flex-1 bg-[#E8F5EE] text-[#006837] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#006837] uppercase tracking-wide mb-0.5">With AI</p>
          <p className="text-lg font-bold">4–8 hours</p>
          <p className="text-xs text-[#006837]">Automated fuzzy matching, confidence scoring, review flagging</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Farms Matched */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Farms Matched</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High confidence</span>
              <span className="bg-[#E8F5EE] text-[#006837] px-2 py-0.5 rounded-full text-xs font-semibold">10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium confidence</span>
              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low confidence</span>
              <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold">1</span>
            </div>
          </div>
        </div>

        {/* Animals Matched */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Animals Matched</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High confidence</span>
              <span className="bg-[#E8F5EE] text-[#006837] px-2 py-0.5 rounded-full text-xs font-semibold">38</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium confidence</span>
              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low confidence</span>
              <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold">4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Correlation table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800">Entity Correlation Results</h2>
        <p className="text-xs text-gray-400 mb-4">8 correlation pairs · Click row to inspect</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {['Source A Entity', 'Source B Entity', 'Match Factors', 'Confidence', 'Status'].map(col => (
                  <th key={col} className="text-left pb-2 pr-4 text-gray-400 font-semibold text-[11px] uppercase tracking-wide">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CORRELATION_ROWS.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-50 last:border-0 ${row.status === 'Low' ? 'bg-red-50/50' : ''}`}
                >
                  <td className="py-2 pr-4 font-mono text-gray-700 text-[11px]">{row.sourceA}</td>
                  <td className="py-2 pr-4 font-mono text-gray-700 text-[11px]">{row.sourceB}</td>
                  <td className="py-2 pr-4 text-gray-600">{row.matchFactors}</td>
                  <td className="py-2 pr-4 font-semibold text-gray-800">{row.confidence}</td>
                  <td className="py-2">
                    <span className={confidenceBadge(row.status)}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analyze button */}
      <button className="bg-[#006837] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#004D28] transition-colors w-full flex items-center justify-center gap-2">
        <GitMerge className="h-4 w-4" />
        Analyze Correlations
      </button>
    </div>
  )
}
