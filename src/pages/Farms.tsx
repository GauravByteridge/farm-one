/**
 * Farms — Farm comparison table (Persona A)
 * Shows all farms with metrics + slide-out source disagreement detail.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ChevronRight, X } from 'lucide-react'
import { fetchFarms, fetchFarmDetail } from '@/api/endpoints/farms'
import type { FarmItem } from '@/types/api'
import { useAppStore } from '@/stores/appStore'

function DqBadge({ score }: { score: number }) {
  const color = score >= 95 ? 'text-green-700 bg-green-50' :
                score >= 90 ? 'text-amber-700 bg-amber-50' : 'text-red-600 bg-red-50'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{score.toFixed(1)}%</span>
}

export default function Farms() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { primary, vsScope } = useAppStore()
  const { data, isLoading, error } = useQuery({ queryKey: ['farms', primary.country, primary.region, primary.farmId], queryFn: fetchFarms })
  const { data: detail } = useQuery({
    queryKey: ['farm-detail', selectedId],
    queryFn: () => fetchFarmDetail(selectedId!),
    enabled: !!selectedId,
  })

  const filteredFarms = (data?.farms ?? []).filter((f: FarmItem) => {
    if (primary.country && f.country !== primary.country) return false
    if (primary.region && f.region !== primary.region) return false
    if (primary.farmId && f.canonical_farm_id !== primary.farmId) return false
    return true
  })

  if (isLoading) return <div className="p-6"><div className="bg-white rounded-xl border border-gray-200 p-8 animate-pulse h-64" /></div>
  if (error || !data) return (
    <div className="p-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p className="text-sm">Could not load farms. Make sure the backend is running at http://localhost:8000</p>
    </div>
  )

  const cols = ['Farm', 'Region', 'Country', 'Animals', 'Avg Milk/Cow', 'Feed Cost/kg', 'DQ Score', 'Status']

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Farms</h1>
      <p className="text-sm text-gray-500 mb-5">{filteredFarms.length} farms · Click a row to see source comparison</p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {cols.map(c => (
                <th key={c} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{c}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredFarms.map((farm: FarmItem) => (
              <tr
                key={farm.canonical_farm_id}
                className="border-b border-gray-50 hover:bg-[#E8F5EE] cursor-pointer transition-colors"
                onClick={() => setSelectedId(farm.canonical_farm_id === selectedId ? null : farm.canonical_farm_id)}
              >
                <td className="px-4 py-3 font-medium text-gray-900">{farm.farm_name}</td>
                <td className="px-4 py-3 text-gray-600">{farm.region}</td>
                <td className="px-4 py-3 text-gray-600">{farm.country}</td>
                <td className="px-4 py-3 tabular-nums">{farm.active_animals.toLocaleString()}</td>
                <td className="px-4 py-3 tabular-nums">{farm.avg_milk_per_cow_kg.toFixed(1)} kg</td>
                <td className={`px-4 py-3 tabular-nums font-medium ${farm.feed_cost_per_kg_milk > 0.307 ? 'text-red-600' : 'text-green-700'}`}>
                  ${farm.feed_cost_per_kg_milk.toFixed(3)}
                </td>
                <td className="px-4 py-3"><DqBadge score={farm.data_quality_score} /></td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    {farm.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ChevronRight className={`h-4 w-4 text-gray-300 transition-transform ${selectedId === farm.canonical_farm_id ? 'rotate-90 text-[#006837]' : ''}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-out detail panel */}
      {selectedId && detail && (
        <div className="fixed right-0 top-0 bottom-0 w-[380px] bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{detail.farm_name}</h2>
            <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-gray-500">{detail.region} · {detail.country}</p>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Source Comparison</h3>
              <div className="space-y-2">
                {detail.source_records.map(src => (
                  <div key={src.source_system} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">{src.label} ({src.source_system})</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <span>Animals: <b className="text-gray-900">{src.active_animals}</b></span>
                      <span>Avg milk: <b className="text-gray-900">{src.avg_milk_kg} kg</b></span>
                    </div>
                  </div>
                ))}
                <div className="bg-[#E8F5EE] border border-[#D0EBD9] rounded-lg p-3">
                  <p className="text-xs font-semibold text-[#006837] mb-1">✓ Gold (Reconciled)</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#004d28]">
                    <span>Animals: <b>{detail.gold_active_animals}</b></span>
                    <span>Avg milk: <b>{detail.gold_avg_milk_per_cow_kg} kg</b></span>
                  </div>
                  {detail.duplicate_records_removed > 0 && (
                    <p className="text-xs text-[#006837] mt-1.5">
                      {detail.duplicate_records_removed} duplicate records removed during reconciliation
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
