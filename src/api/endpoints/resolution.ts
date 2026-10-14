import { apiClient } from '@/api/client'
import type { ReviewQueueResponse, MatchDecisionResponse, MatchDecisionRequest } from '@/types/api'

export async function fetchReviewQueue(): Promise<ReviewQueueResponse> {
  return (await apiClient.get<ReviewQueueResponse>('/api/v1/matches/review-queue')).data
}

export async function postMatchDecision(id: string, body: MatchDecisionRequest): Promise<MatchDecisionResponse> {
  return (await apiClient.post<MatchDecisionResponse>(`/api/v1/matches/${id}/decision`, body)).data
}
