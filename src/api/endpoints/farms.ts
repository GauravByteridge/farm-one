import { apiClient } from '@/api/client'
import type { FarmsListResponse, FarmDetail, FarmTrendResponse } from '@/types/api'

export async function fetchFarms(): Promise<FarmsListResponse> {
  const res = await apiClient.get<FarmsListResponse>('/api/v1/farms')
  return res.data
}

export async function fetchFarmDetail(farmId: string): Promise<FarmDetail> {
  const res = await apiClient.get<FarmDetail>(`/api/v1/farms/${farmId}`)
  return res.data
}

export async function fetchFarmTrend(farmId: string, days = 30): Promise<FarmTrendResponse> {
  const res = await apiClient.get<FarmTrendResponse>(`/api/v1/farms/${farmId}/trend?days=${days}`)
  return res.data
}
