import { z } from 'zod'

export const SourceLandscapeCardSchema = z.object({
  source_system: z.string(),
  total_farms: z.number(),
  total_animals: z.number(),
  total_customers: z.number(),
  entity_types: z.array(z.string()),
  identifier_types: z.array(z.string()),
  schema_fields: z.number(),
  time_range_start: z.string(),
  time_range_end: z.string(),
  last_ingested_at: z.string(),
  format: z.string(),
})

export const SchemaFieldDiffSchema = z.object({
  field_name: z.string(),
  source_a_type: z.string().nullable(),
  source_b_type: z.string().nullable(),
  source_c_type: z.string().nullable(),
  agreement: z.enum(['match', 'mismatch', 'missing']),
})

export const LandscapeSchema = z.object({
  run_id: z.string(),
  source_cards: z.array(SourceLandscapeCardSchema),
  schema_diffs: z.array(SchemaFieldDiffSchema),
})
