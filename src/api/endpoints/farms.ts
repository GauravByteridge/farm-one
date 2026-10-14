/**
 * MOCK MODE — no backend required.
 * Returns static data matching FarmsListResponse / FarmDetail / FarmTrendResponse shapes.
 */
import type { FarmsListResponse, FarmDetail, FarmTrendResponse } from '@/types/api'

const MOCK_FARMS: FarmsListResponse = {
  farms: [
    { canonical_farm_id: 'FARM-00101', farm_name: 'Green Valley Farm',     region: 'North', country: 'United Kingdom', farm_type: 'Dairy',      herd_size_band: '1000-1499', status: 'active', active_animals: 1240, milking_cows: 980,  avg_milk_per_cow_kg: 29.8, feed_cost_per_kg_milk: 0.28, data_quality_score: 95.5, source_count: 3, last_updated: '2024-06-15' },
    { canonical_farm_id: 'FARM-00142', farm_name: 'Sunrise Farm',          region: 'South', country: 'United Kingdom', farm_type: 'Dairy',      herd_size_band: '500-999',  status: 'active', active_animals: 980,  milking_cows: 760,  avg_milk_per_cow_kg: 27.4, feed_cost_per_kg_milk: 0.31, data_quality_score: 91.0, source_count: 2, last_updated: '2024-06-15' },
    { canonical_farm_id: 'FARM-00203', farm_name: 'Hillside Ranch',        region: 'North', country: 'United Kingdom', farm_type: 'Mixed',      herd_size_band: '500-999',  status: 'active', active_animals: 860,  milking_cows: 640,  avg_milk_per_cow_kg: 22.1, feed_cost_per_kg_milk: 0.39, data_quality_score: 82.3, source_count: 2, last_updated: '2024-06-15' },
    { canonical_farm_id: 'FARM-00267', farm_name: 'Valley View Estate',    region: 'Midlands', country: 'United Kingdom', farm_type: 'Dairy',   herd_size_band: '1000-1499', status: 'active', active_animals: 1150, milking_cows: 920,  avg_milk_per_cow_kg: 31.2, feed_cost_per_kg_milk: 0.26, data_quality_score: 98.5, source_count: 3, last_updated: '2024-06-15' },
    { canonical_farm_id: 'FARM-00312', farm_name: 'Blue Ridge Dairy',      region: 'South', country: 'United Kingdom', farm_type: 'Dairy',      herd_size_band: '500-999',  status: 'active', active_animals: 920,  milking_cows: 710,  avg_milk_per_cow_kg: 28.6, feed_cost_per_kg_milk: 0.29, data_quality_score: 94.2, source_count: 3, last_updated: '2024-06-15' },
    { canonical_farm_id: 'FARM-00348', farm_name: 'Shannon Valley',        region: 'Munster', country: 'Ireland',       farm_type: 'Dairy',     herd_size_band: '1000-1499', status: 'active', active_animals: 1100, milking_cows: 890,  avg_milk_per_cow_kg: 26.9, feed_cost_per_kg_milk: 0.27, data_quality_score: 89.4, source_count: 2, last_updated: '2024-06-15' },
    { canonical_farm_id: 'FARM-00389', farm_name: 'Kilkenny Pastures',     region: 'Leinster', country: 'Ireland',      farm_type: 'Dairy',     herd_size_band: '500-999',  status: 'active', active_animals: 870,  milking_cows: 680,  avg_milk_per_cow_kg: 28.1, feed_cost_per_kg_milk: 0.28, data_quality_score: 93.1, source_count: 3, last_updated: '2024-06-15' },
    { canonical_farm_id: 'FARM-00421', farm_name: 'Cork Grasslands',       region: 'Munster', country: 'Ireland',       farm_type: 'Dairy',     herd_size_band: '500-999',  status: 'active', active_animals: 950,  milking_cows: 740,  avg_milk_per_cow_kg: 27.5, feed_cost_per_kg_milk: 0.29, data_quality_score: 91.8, source_count: 2, last_updated: '2024-06-15' },
    { canonical_farm_id: 'FARM-00452', farm_name: 'De Waard Hoeve',        region: 'Noord-Holland', country: 'Netherlands', farm_type: 'Dairy', herd_size_band: '1000-1499', status: 'active', active_animals: 1320, milking_cows: 1080, avg_milk_per_cow_kg: 32.4, feed_cost_per_kg_milk: 0.25, data_quality_score: 98.2, source_count: 3, last_updated: '2024-06-15' },
    { canonical_farm_id: 'FARM-00487', farm_name: 'Noord-Holland Dairy',   region: 'Noord-Holland', country: 'Netherlands', farm_type: 'Dairy', herd_size_band: '1000-1499', status: 'active', active_animals: 1410, milking_cows: 1150, avg_milk_per_cow_kg: 33.1, feed_cost_per_kg_milk: 0.24, data_quality_score: 97.6, source_count: 3, last_updated: '2024-06-15' },
    { canonical_farm_id: 'FARM-00512', farm_name: 'Canterbury Plains',     region: 'Canterbury', country: 'New Zealand',  farm_type: 'Dairy',   herd_size_band: '2000+',    status: 'active', active_animals: 2200, milking_cows: 1860, avg_milk_per_cow_kg: 25.8, feed_cost_per_kg_milk: 0.22, data_quality_score: 93.4, source_count: 3, last_updated: '2024-06-15' },
    { canonical_farm_id: 'FARM-00534', farm_name: 'Waikato Grasslands',    region: 'Waikato', country: 'New Zealand',    farm_type: 'Dairy',    herd_size_band: '2000+',    status: 'active', active_animals: 2650, milking_cows: 2240, avg_milk_per_cow_kg: 24.6, feed_cost_per_kg_milk: 0.21, data_quality_score: 90.1, source_count: 2, last_updated: '2024-06-15' },
    { canonical_farm_id: 'FARM-00567', farm_name: 'Perthshire Cattle Co.', region: 'North', country: 'United Kingdom', farm_type: 'Beef',       herd_size_band: '500-999',  status: 'active', active_animals: 780,  milking_cows: 0,    avg_milk_per_cow_kg: 0,    feed_cost_per_kg_milk: 0,    data_quality_score: 86.3, source_count: 2, last_updated: '2024-06-15' },
  ],
}

const FARM_DETAILS: Record<string, FarmDetail> = {}
MOCK_FARMS.farms.forEach(f => {
  FARM_DETAILS[f.canonical_farm_id] = {
    canonical_farm_id: f.canonical_farm_id,
    farm_name: f.farm_name,
    region: f.region,
    country: f.country,
    source_records: [
      { source_system: 'source_a', label: 'AgriTrack Pro', active_animals: Math.round(f.active_animals * 1.02), avg_milk_kg: parseFloat((f.avg_milk_per_cow_kg * 1.01).toFixed(1)) },
      { source_system: 'source_b', label: 'FarmCore ERP',  active_animals: Math.round(f.active_animals * 0.97), avg_milk_kg: parseFloat((f.avg_milk_per_cow_kg * 0.98).toFixed(1)) },
      ...(f.source_count >= 3 ? [{ source_system: 'source_c', label: 'HerdVision', active_animals: Math.round(f.active_animals * 1.01), avg_milk_kg: parseFloat((f.avg_milk_per_cow_kg * 1.00).toFixed(1)) }] : []),
    ],
    gold_active_animals: f.active_animals,
    gold_avg_milk_per_cow_kg: f.avg_milk_per_cow_kg,
    duplicate_records_removed: Math.round(f.active_animals * 0.007),
  }
})

export async function fetchFarms(): Promise<FarmsListResponse> {
  await new Promise(r => setTimeout(r, 250))
  return MOCK_FARMS
}

export async function fetchFarmDetail(farmId: string): Promise<FarmDetail> {
  await new Promise(r => setTimeout(r, 150))
  return FARM_DETAILS[farmId] ?? FARM_DETAILS['FARM-00101']
}

export async function fetchFarmTrend(farmId: string, days = 30): Promise<FarmTrendResponse> {
  await new Promise(r => setTimeout(r, 200))
  const farm = MOCK_FARMS.farms.find(f => f.canonical_farm_id === farmId) ?? MOCK_FARMS.farms[0]
  const points = Math.min(days, 365)
  const trend = Array.from({ length: points }, (_, i) => {
    const d = new Date('2024-06-15')
    d.setDate(d.getDate() - (points - 1 - i))
    const base = farm.avg_milk_per_cow_kg
    return {
      date: d.toISOString().slice(0, 10),
      total_milk_kg: Math.round((base + Math.sin(i * 0.3) * 1.2) * (farm.milking_cows || 800)),
      avg_milk_per_cow_kg: parseFloat((base + Math.sin(i * 0.3) * 1.2 + (Math.random() - 0.5) * 0.4).toFixed(1)),
    }
  })
  return { farm_id: farmId, days, trend }
}
