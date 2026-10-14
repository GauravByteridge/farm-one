import { apiClient } from '@/api/client'
import type { PipelineRunsResponse, BenchmarksResponse, CreatePipelineRunResponse } from '@/types/api'

export async function fetchPipelineRuns(): Promise<PipelineRunsResponse> {
  const res = await apiClient.get<PipelineRunsResponse>('/api/v1/pipeline/runs')
  return res.data
}

export async function startPipelineRun(tier = 'T0'): Promise<CreatePipelineRunResponse> {
  const res = await apiClient.post<CreatePipelineRunResponse>('/api/v1/pipeline/runs', { tier })
  return res.data
}

export async function fetchBenchmarks(): Promise<BenchmarksResponse> {
  const res = await apiClient.get<BenchmarksResponse>('/api/v1/benchmarks')
  return res.data
}
