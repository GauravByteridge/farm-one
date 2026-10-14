import { apiClient } from '@/api/client'
import type { CompareRawResponse } from '@/types/api'

export async function fetchCompareRaw(): Promise<CompareRawResponse> {
  const res = await apiClient.get<CompareRawResponse>('/api/v1/compare/raw')
  return res.data
}
