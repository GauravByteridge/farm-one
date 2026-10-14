import { z } from 'zod'

export const MetricRegistrySchema = z.object({
  metric_id: z.string(),
  metric_name: z.string(),
  display_name: z.string(),
  business_definition: z.string(),
  unit: z.string(),
  grain: z.string(),
  allowed_dimensions: z.array(z.string()).nullable(),
  allowed_filters: z.array(z.string()).nullable(),
  source_tables: z.array(z.string()).nullable(),
  calculation_note: z.string().nullable(),
  owner: z.string().nullable(),
  status: z.string(),
  version: z.string(),
  effective_from: z.string(),
  effective_to: z.string(),
  is_current: z.boolean(),
  caveats: z.string().nullable(),
  last_updated_by: z.string().nullable(),
  last_updated_at: z.string().nullable(),
})

export const MetricsListSchema = z.object({
  metrics: z.array(MetricRegistrySchema),
})

export const MetricImpactSampleSchema = z.object({
  canonical_farm_id: z.string(),
  farm_name: z.string(),
  value: z.number(),
  unit: z.string(),
  date: z.string(),
})

export const MetricImpactSchema = z.object({
  metric_id: z.string(),
  metric_name: z.string(),
  display_name: z.string(),
  unit: z.string(),
  samples: z.array(MetricImpactSampleSchema),
})
