import { apiClient } from '@/api/client'
import type { LineageMetricResponse, EntityLineageResponse } from '@/types/api'

export async function fetchLineageMetric(id: string): Promise<LineageMetricResponse> {
  return (await apiClient.get<LineageMetricResponse>(`/api/v1/lineage/metric/${id}`)).data
}

export async function fetchEntityLineage(id: string): Promise<EntityLineageResponse> {
  return (await apiClient.get<EntityLineageResponse>(`/api/v1/entities/${id}/lineage`)).data
}
