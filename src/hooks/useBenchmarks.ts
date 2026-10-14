import { useQuery } from '@tanstack/react-query'
import { fetchBenchmarks } from '@/api'

export function useBenchmarks() {
  return useQuery({
    queryKey: ['benchmarks'],
    queryFn: fetchBenchmarks,
    staleTime: 60_000,
  })
}
