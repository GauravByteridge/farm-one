/**
 * MOCK MODE — no backend required.
 * Returns static data matching AnimalsListResponse / AnimalDetail shapes.
 */
import type { AnimalsListResponse, AnimalDetail } from '@/types/api'

export interface AnimalListParams {
  farm_id?: string
  search?: string
  status?: string
  limit?: number
  offset?: number
}

const BREEDS = ['Holstein', 'Jersey', 'Friesian', 'Brown Swiss', 'Guernsey', 'Ayrshire']
const STATUSES = ['active', 'active', 'active', 'active', 'dry', 'culled']
const FARMS = ['FARM-00101','FARM-00142','FARM-00203','FARM-00267','FARM-00312']

const MOCK_ANIMALS = Array.from({ length: 120 }, (_, i) => {
  const id = String(1000 + i).padStart(4, '0')
  const status = STATUSES[i % STATUSES.length]
  const isMilking = status === 'active'
  const dim = isMilking ? 30 + (i * 7) % 290 : null
  return {
    canonical_animal_id: `ANIMAL-${id}`,
    ear_tag: `UK${String(400000 + i * 13).padStart(9, '0')}`,
    breed: BREEDS[i % BREEDS.length],
    sex: 'female',
    birth_date: `${2019 + (i % 5)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    animal_type: 'cow',
    status,
    is_milking_cow: isMilking,
    days_in_milk: dim,
    avg_milk_per_cow_kg: isMilking ? parseFloat((22 + (i % 12) + Math.sin(i * 0.4) * 2).toFixed(1)) : null,
    canonical_farm_id: FARMS[i % FARMS.length],
    last_event: i % 8 === 0 ? 'mastitis_treatment' : i % 12 === 0 ? 'dry_off' : null,
  }
})

export async function fetchAnimals(params: AnimalListParams = {}): Promise<AnimalsListResponse> {
  await new Promise(r => setTimeout(r, 250))
  let list = [...MOCK_ANIMALS]
  if (params.farm_id) list = list.filter(a => a.canonical_farm_id === params.farm_id)
  if (params.status) list = list.filter(a => a.status === params.status)
  if (params.search) {
    const q = params.search.toLowerCase()
    list = list.filter(a => a.ear_tag?.toLowerCase().includes(q) || a.breed?.toLowerCase().includes(q))
  }
  const offset = params.offset ?? 0
  const limit  = params.limit  ?? 20
  return {
    total: list.length,
    limit,
    offset,
    animals: list.slice(offset, offset + limit),
  }
}

export async function fetchAnimalDetail(animalId: string): Promise<AnimalDetail> {
  await new Promise(r => setTimeout(r, 150))
  const base = MOCK_ANIMALS.find(a => a.canonical_animal_id === animalId) ?? MOCK_ANIMALS[0]
  const trend = Array.from({ length: 30 }, (_, i) => {
    const d = new Date('2024-06-15')
    d.setDate(d.getDate() - (29 - i))
    return {
      date: d.toISOString().slice(0, 10),
      milk_kg: parseFloat(((base.avg_milk_per_cow_kg ?? 26) + Math.sin(i * 0.4) * 1.5 + (Math.random() - 0.5) * 0.8).toFixed(1)),
    }
  })
  return {
    ...base,
    production_trend: trend,
    events: [
      { date: '2024-05-12', type: 'health_check',   description: 'Routine health check — all clear' },
      { date: '2024-04-03', type: 'breeding',        description: 'AI insemination — Bull-A442' },
      { date: '2024-03-15', type: 'dry_off_alert',   description: 'DIM 280 — approaching dry-off window' },
    ],
  }
}
