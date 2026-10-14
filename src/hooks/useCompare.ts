import { useQuery } from '@tanstack/react-query'
import { fetchCompareRaw } from '@/api'

export function useCompare() {
  return useQuery({
    queryKey: ['compare-raw'],
    queryFn: fetchCompareRaw,
    staleTime: 60_000,
  })
}
