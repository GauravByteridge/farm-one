import { z } from 'zod'

export const SourceMetricValuesSchema = z.object({
  source_system: z.string(),
  run_id: z.string(),
  run_date: z.string(),
  active_animal_count: z.number().nullable(),
  active_milking_cow_count: z.number().nullable(),
  avg_milk_per_cow_kg: z.number().nullable(),
  total_milk_kg: z.number().nullable(),
  data_quality_score: z.number().nullable(),
  total_records: z.number(),
})

export const MetricDisagreementSchema = z.object({
  metric_name: z.string(),
  display_name: z.string(),
  values: z.record(z.string(), z.number().nullable()),
  canonical_value: z.number().nullable(),
  variance_pct: z.number().nullable(),
})

export const CompareRawSchema = z.object({
  farm_id: z.string(),
  run_id: z.string(),
  source_cards: z.array(SourceMetricValuesSchema),
  disagreements: z.array(MetricDisagreementSchema),
})
