import { useQuery } from '@tanstack/react-query'
import { fetchDqScorecard } from '@/api'

export function useDqScorecard() {
  return useQuery({
    queryKey: ['dq-scorecard'],
    queryFn: fetchDqScorecard,
    staleTime: 60_000,
  })
}
