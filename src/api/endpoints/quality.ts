import { apiClient } from '@/api/client'
import type { DqScorecardResponse, DqIssuesResponse } from '@/types/api'

export async function fetchDqScorecard(): Promise<DqScorecardResponse> {
  const res = await apiClient.get<DqScorecardResponse>('/api/v1/dq/scorecard')
  return res.data
}

export async function fetchDqIssues(): Promise<DqIssuesResponse> {
  const res = await apiClient.get<DqIssuesResponse>('/api/v1/dq/issues')
  return res.data
}
