import { z } from 'zod'

export const LineageLogSchema = z.object({
  lineage_id: z.string(),
  entity_type: z.string(),
  canonical_id: z.string(),
  run_id: z.string(),
  pipeline_version: z.string().nullable(),
  source_systems: z.array(z.string()).nullable(),
  source_record_ids: z.array(z.string()).nullable(),
  transformation_steps: z.array(z.string()).nullable(),
  quality_rules_applied: z.array(z.string()).nullable(),
  metric_version: z.string().nullable(),
  query_signature: z.string().nullable(),
  created_at: z.string(),
})

export const LineageMetricSchema = z.object({
  metric_id: z.string(),
  lineage_records: z.array(LineageLogSchema),
})

export const EntityLineageSchema = z.object({
  entity_type: z.string(),
  canonical_id: z.string(),
  lineage_records: z.array(LineageLogSchema),
})
