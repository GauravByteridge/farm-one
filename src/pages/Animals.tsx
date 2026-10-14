/**
 * Animals — Animal list with detail slide-out (Persona B)
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Search, X, ChevronRight, AlertTriangle } from 'lucide-react'
import { fetchAnimals, fetchAnimalDetail } from '@/api/endpoints/animals'

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  culled: 'bg-red-100 text-red-600',
  sold: 'bg-gray-100 text-gray-600',
  dry: 'bg-amber-100 text-amber-600',
  heifer: 'bg-blue-100 text-blue-600',
}

const EVENT_TYPE_STYLES: Record<string, string> = {
  health: 'bg-red-100 text-red-600',
  feed: 'bg-amber-100 text-amber-600',
  breeding: 'bg-purple-100 text-purple-600',
}

export default function Animals() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const limit = 20

  const { data, isLoading, error } = useQuery({
    queryKey: ['animals', search, status, page],
    queryFn: () => fetchAnimals({ search, status: status || undefined, limit, offset: page * limit }),
  })

  const { data: detail } = useQuery({
    queryKey: ['animal-detail', selectedId],
    queryFn: () => fetchAnimalDetail(selectedId!),
    enabled: !!selectedId,
  })

  if (error) return (
    <div className="p-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p className="text-sm">Could not load animals. Make sure the backend is running at http://localhost:8000</p>
    </div>
  )

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Animals</h1>
      <p className="text-sm text-gray-500 mb-5">
        {data ? `${data.total.toLocaleString()} animals` : 'Loading…'} · Click a row for detail
      </p>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ear tag or ID…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#006837]"
          />
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(0) }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#006837]"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="dry">Dry</option>
          <option value="heifer">Heifer</option>
          <option value="culled">Culled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 animate-pulse space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Animal ID', 'Ear Tag', 'Breed', 'Status', 'Milking', 'Avg Milk/Day', 'Last Event'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {data?.animals.map(a => (
                  <tr
                    key={a.canonical_animal_id}
                    className="border-b border-gray-50 hover:bg-[#E8F5EE] cursor-pointer transition-colors"
                    onClick={() => setSelectedId(a.canonical_animal_id === selectedId ? null : a.canonical_animal_id)}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{a.canonical_animal_id}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-900">{a.ear_tag ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-600">{a.breed ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{a.is_milking_cow ? '✓' : '—'}</td>
                    <td className="px-4 py-2.5 tabular-nums text-gray-700">
                      {a.avg_milk_per_cow_kg != null ? `${a.avg_milk_per_cow_kg.toFixed(1)} kg` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs max-w-[160px] truncate">{a.last_event ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <ChevronRight className={`h-4 w-4 text-gray-300 transition-transform ${selectedId === a.canonical_animal_id ? 'rotate-90 text-[#006837]' : ''}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            {data && data.total > limit && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Showing {page * limit + 1}–{Math.min((page + 1) * limit, data.total)} of {data.total}
                </p>
                <div className="flex gap-2">
                  <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                    className="text-xs px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                    Previous
                  </button>
                  <button disabled={(page + 1) * limit >= data.total} onClick={() => setPage(p => p + 1)}
                    className="text-xs px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Animal detail panel */}
      {selectedId && detail && (
        <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900">{detail.ear_tag ?? detail.canonical_animal_id}</h2>
              <p className="text-xs text-gray-500">{detail.breed} · {detail.status} · {detail.days_in_milk ? `${detail.days_in_milk} DIM` : ''}</p>
            </div>
            <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Production trend */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">30-Day Production</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={detail.production_trend} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} interval={6} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${v}kg`} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)} kg`, 'Milk']}
                    contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Line dataKey="milk_kg" stroke="#006837" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Events timeline */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Events</h3>
              {detail.events.length === 0 ? (
                <p className="text-xs text-gray-400">No events recorded.</p>
              ) : (
                <div className="space-y-2">
                  {detail.events.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                        <div className="h-2 w-2 rounded-full bg-[#006837]" />
                        {i < detail.events.length - 1 && <div className="w-0.5 h-6 bg-gray-200" />}
                      </div>
                      <div className="pb-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${EVENT_TYPE_STYLES[ev.type] ?? 'bg-gray-100 text-gray-600'}`}>
                            {ev.type}
                          </span>
                          <span className="text-gray-400">{ev.date}</span>
                        </div>
                        <p className="text-gray-700">{ev.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
