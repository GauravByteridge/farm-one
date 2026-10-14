import { z } from 'zod'

export const AskResponseSchema = z.object({
  question: z.string(),
  answer: z.string(),
  value: z.number().nullable(),
  unit: z.string().nullable(),
  metric_id: z.string().nullable(),
  metric_name: z.string().nullable(),
  metric_used: z.string().nullable(),
  is_certified: z.boolean(),
  calculation_note: z.string().nullable(),
  lineage_id: z.string().nullable(),
  applied_filters: z.record(z.string(), z.string()),
  data_quality_note: z.string().nullable(),
  is_ambiguous: z.boolean(),
  suggested_refinements: z.array(z.string()),
  is_unsupported: z.boolean(),
  model: z.string(),
  latency_ms: z.number(),
})
