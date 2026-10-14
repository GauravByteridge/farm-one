import { z } from 'zod'

export const EntityResolutionSchema = z.object({
  resolution_id: z.string(),
  entity_type: z.string(),
  canonical_id: z.string(),
  source_record_count: z.number(),
  source_systems: z.array(z.string()).nullable(),
  source_ids: z.array(z.string()).nullable(),
  match_method: z.string().nullable(),
  confidence_score: z.number().nullable(),
  match_evidence: z.string().nullable(),
  review_status: z.string(),
  review_decision: z.string().nullable(),
  reviewed_by: z.string().nullable(),
  reviewed_at: z.string().nullable(),
  golden_record: z.string().nullable(),
  precision_eval: z.number().nullable(),
  recall_eval: z.number().nullable(),
  run_id: z.string(),
  lineage_id: z.string().nullable(),
  created_at: z.string(),
})

export const ReviewQueueSchema = z.object({
  run_id: z.string(),
  total_count: z.number(),
  pending_count: z.number(),
  auto_merged_count: z.number(),
  resolutions: z.array(EntityResolutionSchema),
})

export const MatchDecisionResponseSchema = z.object({
  resolution_id: z.string(),
  review_status: z.string(),
  review_decision: z.string(),
  reviewed_at: z.string(),
  reviewed_by: z.string(),
})
