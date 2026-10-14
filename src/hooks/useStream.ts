import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchStreamStats, injectBadBatch } from '@/api/endpoints/stream'
export function useStreamStats() { return useQuery({ queryKey: ['stream-stats'], queryFn: fetchStreamStats, refetchInterval: 2000 }) }
export function useInjectBatch() { return useMutation({ mutationFn: injectBadBatch }) }
