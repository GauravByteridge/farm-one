import { apiClient } from '@/api/client'
import type { MetricsListResponse, MetricImpactResponse } from '@/types/api'

export async function fetchMetrics(): Promise<MetricsListResponse> {
  return (await apiClient.get<MetricsListResponse>('/api/v1/metrics')).data
}

export async function fetchMetricImpact(id: string): Promise<MetricImpactResponse> {
  return (await apiClient.get<MetricImpactResponse>(`/api/v1/metrics/${id}/impact`)).data
}
