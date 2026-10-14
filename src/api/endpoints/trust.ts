import { apiClient } from '@/api/client'
import type { DataTrustResponse } from '@/types/api'

export async function fetchDataTrust(): Promise<DataTrustResponse> {
  const res = await apiClient.get<DataTrustResponse>('/api/v1/data-trust')
  return res.data
}
