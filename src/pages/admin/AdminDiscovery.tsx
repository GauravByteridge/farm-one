import { useState } from 'react'
import { Search } from 'lucide-react'

const SOURCES = [
  { id: 'postgres', emoji: '🐘', label: 'PostgreSQL',    sub: 'Feed Management System',      defaultOn: true  },
  { id: 'mongodb',  emoji: '🍃', label: 'MongoDB',       sub: 'Production Tracking System',  defaultOn: true  },
  { id: 'mssql',    emoji: '🗄️', label: 'MS SQL Server', sub: 'Genetics & Breeding System',  defaultOn: false },
  { id: 'csv',      emoji: '📄', label: 'CSV Files',     sub: 'Additional Data Sources',     defaultOn: false },
]

export default function AdminDiscovery() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(SOURCES.filter(s => s.defaultOn).map(s => s.id)),
  )

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
        <h1 className="text-xl font-bold text-gray-900">Schema Discovery</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          AI scans data sources, generates schema documentation, identifies relationships
        </p>
      </div>

      {/* Time-saved banner */}
      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-green-50 p-4 flex items-center gap-4">
        <div className="flex-1 bg-amber-100 text-amber-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-0.5">Manual Effort</p>
          <p className="text-lg font-bold">2–4 weeks</p>
          <p className="text-xs text-amber-700">Schema mapping, relationship discovery, documentation</p>
        </div>
        <div className="text-gray-400 font-bold text-xl shrink-0">→</div>
        <div className="flex-1 bg-[#E8F5EE] text-[#006837] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#006837] uppercase tracking-wide mb-0.5">With AI</p>
          <p className="text-lg font-bold">2–4 hours</p>
          <p className="text-xs text-[#006837]">Automated scanning, relationship inference, report generation</p>
        </div>
      </div>

      {/* Source checkboxes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Select Data Sources</h2>
        <div className="grid grid-cols-2 gap-3">
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
          <Search className="h-4 w-4" />
          Analyze Schemas
        </button>
      </div>

      {/* AI Prompt Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">AI Prompt Preview</h2>
        <pre className="bg-gray-900 rounded-xl p-5 text-green-400 font-mono text-xs leading-relaxed whitespace-pre-wrap">{`You are a data engineering expert analyzing database schemas
for a dairy farm data integration project.

## PostgreSQL: feed_management
Tables: farms, cows, feed_records
Animal IDs: TAG-YYYY-NNN format | Farm codes: alphanumeric

## MongoDB: production_tracking
Collections: farms, animals, production_records
Animal IDs: NAME-YYYY format | Farm IDs: numeric

Analyze: entity relationships, data types, PK/FK mapping,
integration challenges, recommended correlation approach.`}</pre>
      </div>

      {/* Analysis Results */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-800">Analysis Results</h2>
        <p className="text-xs text-gray-400 mb-4">Generated from schema scan · 3 sources</p>
        <div className="space-y-4">
          {[
            {
              label: 'Entity Overview',
              value: '3 source systems · 12 tables · ~2.4M records total',
            },
            {
              label: 'Data Types',
              value: 'Date formats inconsistent (ISO 8601 vs MM/DD/YYYY) · Milk units mixed (kg / lbs)',
            },
            {
              label: 'Relationship Mapping',
              value:
                'farms.farm_code ↔ production.farm_id (fuzzy) · animals.tag ↔ production.animal_id (name extraction)',
            },
            {
              label: 'Integration Challenges',
              value: 'No shared primary key · 3 naming conventions · 2 unit systems',
            },
            {
              label: 'Correlation Approach',
              value:
                'Fuzzy string matching on farm name + location · Birth year extraction for animal IDs',
            },
          ].map(row => (
            <div key={row.label} className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{row.label}</span>
              <span className="text-sm text-gray-800">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
