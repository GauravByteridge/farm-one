import { z } from 'zod'

export const ProposedFieldMappingSchema = z.object({
  field_name: z.string(),
  detected_type: z.string(),
  sample_values: z.array(z.string()),
  proposed_canonical_field: z.string().nullable(),
  proposed_canonical_table: z.string().nullable(),
  confidence_pct: z.number(),
  needs_review: z.boolean(),
})

export const ProposedQualityRuleSchema = z.object({
  rule_id: z.string(),
  rule_name: z.string(),
  description: z.string(),
  default_enabled: z.boolean(),
  applies_to: z.array(z.string()),
})

export const OnboardProposeResponseSchema = z.object({
  proposal_id: z.string(),
  source_name: z.string(),
  field_mappings: z.array(ProposedFieldMappingSchema),
  quality_rules: z.array(ProposedQualityRuleSchema),
  notes: z.string().nullable(),
})

export const OnboardApproveResponseSchema = z.object({
  proposal_id: z.string(),
  status: z.string(),
  approved_at: z.string(),
  message: z.string(),
})
