import { z } from 'zod'

export const StreamEventSchema = z.object({
  event_id: z.string(),
  timestamp: z.string(),
  source_system: z.string(),
  entity_type: z.string(),
  event_type: z.string(),
  disposition: z.string(),
  reason_code: z.string().nullable(),
  record_id: z.string(),
})

export const StreamStatsSchema = z.object({
  events_per_second: z.number(),
  avg_latency_ms: z.number(),
  accepted_count: z.number(),
  auto_corrected_count: z.number(),
  quarantined_count: z.number(),
  recent_events: z.array(StreamEventSchema),
  as_of: z.string(),
  mode: z.enum(['live', 'replay']),
})

export const InjectBatchResponseSchema = z.object({
  injected: z.number(),
  accepted: z.number(),
  auto_corrected: z.number(),
  quarantined: z.number(),
  run_id: z.string(),
})
