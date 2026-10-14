import { z } from 'zod'

export const FeedCostAnalysisSchema = z.object({
  analysis_id: z.string(),
  canonical_farm_id: z.string(),
  farm_name: z.string().nullable(),
  region: z.string().nullable(),
  farm_type: z.string().nullable(),
  herd_size_band: z.string().nullable(),
  period_year: z.number(),
  period_month: z.number(),
  total_feed_cost_usd: z.number().nullable(),
  total_milk_kg: z.number().nullable(),
  cost_per_kg_milk: z.number().nullable(),
  farm_cohort: z.string().nullable(),
  cohort_farm_count: z.number().nullable(),
  cohort_avg_cost_per_kg: z.number().nullable(),
  cohort_p25_cost_per_kg: z.number().nullable(),
  cohort_median_cost_per_kg: z.number().nullable(),
  cohort_p75_cost_per_kg: z.number().nullable(),
  cost_rank_in_cohort: z.number().nullable(),
  cost_percentile: z.number().nullable(),
  vs_cohort_avg_pct: z.number().nullable(),
  is_above_cohort: z.boolean().nullable(),
  pre_resolution_cost_per_kg: z.number().nullable(),
  ranking_changed_after_resolution: z.boolean().nullable(),
  run_id: z.string(),
  lineage_id: z.string().nullable(),
  created_at: z.string(),
})

export const FeedCostResponseSchema = z.object({
  period_year: z.number(),
  period_month: z.number(),
  analyses: z.array(FeedCostAnalysisSchema),
})
