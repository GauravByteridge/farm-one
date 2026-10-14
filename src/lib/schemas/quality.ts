import { z } from 'zod'

export const DqSummarySchema = z.object({
  summary_id: z.string(),
  run_id: z.string(),
  run_date: z.string(),
  source_system: z.string(),
  entity_type: z.string(),
  total_records: z.number(),
  passed_records: z.number(),
  auto_corrected_records: z.number(),
  quarantined_records: z.number(),
  pass_rate: z.number().nullable(),
  quarantine_rate: z.number().nullable(),
  duplicate_count: z.number().nullable(),
  missing_id_count: z.number().nullable(),
  unit_inconsistency_count: z.number().nullable(),
  invalid_date_count: z.number().nullable(),
  implausible_value_count: z.number().nullable(),
  schema_drift_count: z.number().nullable(),
  top_issue_codes: z.array(z.string()).nullable(),
  created_at: z.string(),
})

export const DqIssueLogSchema = z.object({
  issue_id: z.string(),
  run_id: z.string(),
  source_system: z.string(),
  entity_type: z.string(),
  source_record_id: z.string(),
  rule_id: z.string(),
  rule_description: z.string().nullable(),
  severity: z.string(),
  disposition: z.string(),
  field_name: z.string().nullable(),
  original_value: z.string().nullable(),
  corrected_value: z.string().nullable(),
  reason_code: z.string().nullable(),
  reason_description: z.string().nullable(),
  sample_record: z.string().nullable(),
  created_at: z.string(),
})

export const DqScorecardSchema = z.object({
  run_id: z.string(),
  summaries: z.array(DqSummarySchema),
})

export const DqIssuesSchema = z.object({
  run_id: z.string(),
  total_count: z.number(),
  issues: z.array(DqIssueLogSchema),
})
