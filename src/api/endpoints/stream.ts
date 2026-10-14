import { apiClient } from '@/api/client'
import type { StreamStatsResponse, InjectBatchResponse } from '@/types/api'

export async function fetchStreamStats(): Promise<StreamStatsResponse> {
  const res = await apiClient.get<StreamStatsResponse>('/api/v1/stream/stats')
  return res.data
}

export async function injectBadBatch(): Promise<InjectBatchResponse> {
  const res = await apiClient.post<InjectBatchResponse>('/api/v1/stream/inject')
  return res.data
}
