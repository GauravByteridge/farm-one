import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPipelineRuns, startPipelineRun } from '@/api'
import type { CreatePipelineRunRequest } from '@/types/api'

export function usePipeline() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['pipeline-runs'],
    queryFn: fetchPipelineRuns,
    staleTime: 60_000,
  })

  const mutation = useMutation({
    mutationFn: (req: CreatePipelineRunRequest) => startPipelineRun(req.tier ?? 'T0'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-runs'] })
    },
  })

  return { query, mutation }
}
