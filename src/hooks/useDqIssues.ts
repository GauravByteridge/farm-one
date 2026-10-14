import { useQuery } from '@tanstack/react-query'
import { fetchDqIssues } from '@/api'

export interface DqIssueFilters {
  source_system?: string
  entity_type?: string
  severity?: string
  disposition?: string
}

export function useDqIssues(filters: DqIssueFilters = {}) {
  return useQuery({
    queryKey: ['dq-issues', filters],
    queryFn: fetchDqIssues,
    staleTime: 60_000,
  })
}
