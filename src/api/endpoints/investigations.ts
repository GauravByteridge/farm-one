import { apiClient } from '@/api/client'
import type { InvestigationsResponse } from '@/types/api'

export async function fetchInvestigations(): Promise<InvestigationsResponse> {
  const res = await apiClient.get<InvestigationsResponse>('/api/v1/investigations')
  return res.data
}
