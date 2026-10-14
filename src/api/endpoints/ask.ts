import { apiClient } from '@/api/client'
import type { AskRequest, AskResponse } from '@/types/api'

export async function postAsk(req: AskRequest): Promise<AskResponse> {
  const res = await apiClient.post<AskResponse>('/api/v1/ask', req)
  return res.data
}
