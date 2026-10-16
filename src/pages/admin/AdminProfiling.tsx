import { useState } from 'react'
import { BarChart2 } from 'lucide-react'

const SOURCES = [
  { id: 'postgres', emoji: '🐘', label: 'PostgreSQL', sub: 'Feed Management System' },
  { id: 'mongodb',  emoji: '🍃', label: 'MongoDB',    sub: 'Production Tracking System' },
  { id: 'csv',      emoji: '📄', label: 'CSV Files',  sub: 'Milk Buyers & Genetics' },
]

const KPI_CARDS = [
  {
    source: 'PostgreSQL',
    score: '96.2%',
    borderColor: 'border-[#006837]',
    badgeClass: 'bg-[#E8F5EE] text-[#006837]',
    sub: '98.2% complete · 3 tables',
  },
  {
    source: 'MongoDB',
    score: '91.4%',
    borderColor: 'border-amber-400',
    badgeClass: 'bg-amber-50 text-amber-700',
    sub: '94.7% complete · 2 collections',
  },
  {
    source: 'Overall',
    score: '94.1%',
    borderColor: 'border-blue-500',
    badgeClass: 'bg-blue-50 text-blue-700',
    sub: 'Across 3 sources',
  },
]

type QualityLevel = 'High' | 'Medium' | 'Low'

interface ProfileRow {
  field: string
  type: string
  nullPct: string
  distinct: string
  sample: string
  quality: QualityLevel
}

const PG_ROWS: ProfileRow[] = [
  { field: 'farm_id',   type: 'VARCHAR(10)', nullPct: '0.0%', distinct: '5',     sample: 'MAD-001',       quality: 'High'   },
  { field: 'cow_tag',   type: 'VARCHAR(20)', nullPct: '0.2%', distinct: '3,835', sample: 'TAG-2019-001',  quality: 'High'   },
  { field: 'feed_date', type: 'DATE',        nullPct: '0.0%', distinct: '365',   sample: '2024-06-15',    quality: 'High'   },
  { field: 'feed_kg',   type: 'FLOAT',       nullPct: '1.4%', distinct: '8,241', sample: '24.50',         quality: 'Medium' },
  { field: 'feed_type', type: 'VARCHAR(30)', nullPct: '3.1%', distinct: '12',    sample: 'Corn Silage',   quality: 'Medium' },
  { field: 'cost_eur',  type: 'FLOAT',       nullPct: '5.8%', distinct: '2,841', sample: '7.32',          quality: 'Low'    },
]

const MONGO_ROWS: ProfileRow[] = [
  { field: 'farm_id',     type: 'Integer',  nullPct: '0.0%', distinct: '5',     sample: '345',                    quality: 'High'   },
  { field: 'animal_id',   type: 'String',   nullPct: '0.4%', distinct: '3,901', sample: 'BESSIE-2019',            quality: 'High'   },
  { field: 'record_date', type: 'ISODate',  nullPct: '0.0%', distinct: '365',   sample: '2024-06-15T00:00:00Z',   quality: 'High'   },
  { field: 'milk_litres', type: 'Double',   nullPct: '2.1%', distinct: '7,412', sample: '28.42',                  quality: 'Medium' },
  { field: 'fat_pct',     type: 'Double',   nullPct: '4.8%', distinct: '389',   sample: '4.08',                   quality: 'Medium' },
  { field: 'scc',         type: 'Integer',  nullPct: '8.2%', distinct: '3,012', sample: '142000',                 quality: 'Low'    },
]

function qualityBadge(q: QualityLevel) {
  if (q === 'High')   return 'bg-[#E8F5EE] text-[#006837] px-2 py-0.5 rounded-full text-xs font-semibold'
  if (q === 'Medium') return 'bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold'
  return 'bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold'
}

function ProfileTable({ title, rows }: { title: string; rows: ProfileRow[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-600 mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              {['Field', 'Type', 'Null%', 'Distinct', 'Sample', 'Quality'].map(col => (
                <th key={col} className="text-left pb-2 pr-3 text-gray-400 font-semibold text-[11px] uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.field} className="border-b border-gray-50 last:border-0">
                <td className="py-1.5 pr-3 font-mono text-gray-800 font-semibold">{row.field}</td>
                <td className="py-1.5 pr-3 font-mono text-gray-500">{row.type}</td>
                <td className="py-1.5 pr-3 text-gray-600">{row.nullPct}</td>
                <td className="py-1.5 pr-3 text-gray-600">{row.distinct}</td>
                <td className="py-1.5 pr-3 font-mono text-gray-600 max-w-[140px] truncate">{row.sample}</td>
                <td className="py-1.5">
                  <span className={qualityBadge(row.quality)}>{row.quality}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminProfiling() {
  const [selected, setSelected] = useState<Set<string>>(new Set(SOURCES.map(s => s.id)))

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Data Profiling</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          AI analyzes data quality, detects anomalies, suggests cleansing rules
        </p>
      </div>

      {/* Time-saved banner */}
      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-green-50 p-4 flex items-center gap-4">
        <div className="flex-1 bg-amber-100 text-amber-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-0.5">Manual Effort</p>
          <p className="text-lg font-bold">3–6 weeks</p>
          <p className="text-xs text-amber-700">Manual profiling across all tables, columns, and sources</p>
        </div>
        <div className="text-gray-400 font-bold text-xl shrink-0">→</div>
        <div className="flex-1 bg-[#E8F5EE] text-[#006837] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#006837] uppercase tracking-wide mb-0.5">With AI</p>
          <p className="text-lg font-bold">3–6 hours</p>
          <p className="text-xs text-[#006837]">Automated quality scoring, anomaly detection, cleansing recommendations</p>
        </div>
      </div>

      {/* Source checkboxes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Select Data Sources</h2>
        <div className="grid grid-cols-3 gap-3">
          {SOURCES.map(src => {
            const isOn = selected.has(src.id)
            return (
              <div
                key={src.id}
                onClick={() => toggle(src.id)}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center gap-3 ${
                  isOn ? 'border-[#006837] bg-[#E8F5EE]' : 'border-gray-200 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggle(src.id)}
                  className="h-4 w-4 accent-[#006837] shrink-0"
                  onClick={e => e.stopPropagation()}
                />
                <span className="text-xl shrink-0">{src.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{src.label}</p>
                  <p className="text-xs text-gray-400">{src.sub}</p>
                </div>
              </div>
            )
          })}
        </div>
        <button className="bg-[#006837] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#004D28] transition-colors mt-4 w-full flex items-center justify-center gap-2">
          <BarChart2 className="h-4 w-4" />
          Analyze Data Quality
        </button>
      </div>

      {/* Quality KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        {KPI_CARDS.map(card => (
          <div key={card.source} className={`bg-white rounded-xl border border-gray-200 border-t-4 ${card.borderColor} p-5`}>
            <p className="text-xs font-semibold text-gray-500 mb-1">{card.source}</p>
            <p className="text-2xl font-bold text-gray-900">{card.score}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${card.badgeClass}`}>
              Quality Score
            </span>
          </div>
        ))}
      </div>

      {/* AI Quality Analysis — profiling tables */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">AI Quality Analysis</h2>
        <p className="text-xs text-gray-400 mb-4">Column-level profiling with quality classification</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ProfileTable title="PostgreSQL: feed_records" rows={PG_ROWS} />
          <ProfileTable title="MongoDB: production_records" rows={MONGO_ROWS} />
        </div>
      </div>
    </div>
  )
}
