import { apiClient } from '@/api/client'
import type { AnimalsListResponse, AnimalDetail } from '@/types/api'

export interface AnimalListParams {
  farm_id?: string
  search?: string
  status?: string
  limit?: number
  offset?: number
}

export async function fetchAnimals(params: AnimalListParams = {}): Promise<AnimalsListResponse> {
  const qs = new URLSearchParams()
  if (params.farm_id) qs.set('farm_id', params.farm_id)
  if (params.search) qs.set('search', params.search)
  if (params.status) qs.set('status', params.status)
  if (params.limit) qs.set('limit', String(params.limit))
  if (params.offset) qs.set('offset', String(params.offset))
  const res = await apiClient.get<AnimalsListResponse>(`/api/v1/animals?${qs}`)
  return res.data
}

export async function fetchAnimalDetail(animalId: string): Promise<AnimalDetail> {
  const res = await apiClient.get<AnimalDetail>(`/api/v1/animals/${animalId}`)
  return res.data
}
