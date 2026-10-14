import { z } from 'zod'

export const PipelineRunSchema = z.object({
  run_id: z.string(),
  run_date: z.string(),
  started_at: z.string(),
  completed_at: z.string().nullable(),
  status: z.string(),
  tier: z.string(),
  total_input_rows: z.number().nullable(),
  total_output_rows: z.number().nullable(),
  bronze_rows: z.number().nullable(),
  silver_passed_rows: z.number().nullable(),
  silver_quarantined_rows: z.number().nullable(),
  gold_rows: z.number().nullable(),
  generation_duration_s: z.number().nullable(),
  ingestion_duration_s: z.number().nullable(),
  silver_duration_s: z.number().nullable(),
  resolution_duration_s: z.number().nullable(),
  gold_duration_s: z.number().nullable(),
  total_duration_s: z.number().nullable(),
  error_message: z.string().nullable(),
  config_snapshot: z.string().nullable(),
})

export const BenchmarkResultSchema = z.object({
  benchmark_id: z.string(),
  run_id: z.string(),
  tier: z.string(),
  run_date: z.string(),
  environment_description: z.string().nullable(),
  data_size_gb: z.number().nullable(),
  total_rows_generated: z.number().nullable(),
  total_rows_processed: z.number().nullable(),
  throughput_rows_per_s: z.number().nullable(),
  entity_matching_precision: z.number().nullable(),
  entity_matching_recall: z.number().nullable(),
  entity_matching_f1: z.number().nullable(),
  is_measured: z.boolean(),
  notes: z.string().nullable(),
  created_at: z.string(),
})

export const PipelineRunsSchema = z.object({
  runs: z.array(PipelineRunSchema),
})

export const BenchmarksSchema = z.object({
  benchmarks: z.array(BenchmarkResultSchema),
})

export const CreatePipelineRunResponseSchema = z.object({
  run_id: z.string(),
  status: z.string(),
  started_at: z.string(),
  message: z.string(),
})
