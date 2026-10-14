import { apiClient } from '@/api/client'
import type { OverviewResponse } from '@/types/api'

export async function fetchOverview(): Promise<OverviewResponse> {
  const res = await apiClient.get<OverviewResponse>('/api/v1/overview')
  return res.data
}
