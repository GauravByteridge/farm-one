/**
 * TypeScript interfaces mirroring the Gold layer schemas defined in
 * one_herd_truth/schemas/gold/gold_schemas.py
 *
 * Rules:
 *  - ArrayType(StringType) → string[]
 *  - TimestampType → string (ISO 8601)
 *  - DateType → string (ISO 8601 date)
 *  - DecimalType → number
 *  - nullable=True → T | null
 *  - nullable=False → T (never undefined)
 */

// ─── Dimensions ───────────────────────────────────────────────────────────────

export interface DimFarm {
  canonical_farm_id: string
  farm_name: string | null
  region: string | null
  country: string | null
  farm_type: string | null
  production_system: string | null
  herd_size_band: string | null
  status: string | null
  source_systems: string[] | null
  source_farm_ids: string[] | null
  effective_from: string
  effective_to: string
  is_current: boolean
  run_id: string
  lineage_id: string | null
  created_at: string
  updated_at: string
}

export interface DimAnimal {
  canonical_animal_id: string
  canonical_farm_id: string
  ear_tag: string | null
  eid: string | null
  registration_number: string | null
  breed: string | null
  sex: string | null
  birth_date: string | null
  animal_type: string | null
  lactation_number: number | null
  days_in_milk: number | null
  is_milking_cow: boolean
  status: string
  status_date: string | null
  source_systems: string[] | null
  source_animal_ids: string[] | null
  effective_from: string
  effective_to: string
  is_current: boolean
  run_id: string
  lineage_id: string | null
  created_at: string
  updated_at: string
}

export interface DimCustomer {
  canonical_customer_id: string
  customer_name: string | null
  account_type: string | null
  region: string | null
  country: string | null
  associated_farm_ids: string[] | null
  status: string
  source_systems: string[] | null
  source_customer_ids: string[] | null
  effective_from: string
  effective_to: string
  is_current: boolean
  run_id: string
  lineage_id: string | null
  created_at: string
  updated_at: string
}

// ─── Facts ────────────────────────────────────────────────────────────────────

export interface FactMilkProduction {
  production_id: string
  canonical_animal_id: string
  canonical_farm_id: string
  production_date: string
  milking_session: string | null
  milk_quantity_kg: number | null
  original_quantity: number | null
  original_unit: string | null
  fat_pct: number | null
  protein_pct: number | null
  somatic_cell_count: number | null
  is_estimated: boolean
  quality_status: string
  quality_rule_ids: string[] | null
  source_system: string
  source_record_id: string
  ingestion_run_id: string
  lineage_id: string | null
  ingested_at: string
}

export interface FactFeedCost {
  feed_cost_id: string
  canonical_farm_id: string
  period_year: number
  period_month: number
  feed_type: string | null
  feed_quantity_kg: number | null
  feed_cost_usd: number | null
  original_cost: number | null
  original_currency: string | null
  exchange_rate_used: number | null
  milk_production_kg: number | null
  cost_per_kg_milk: number | null
  quality_status: string
  source_system: string
  source_record_id: string
  ingestion_run_id: string
  lineage_id: string | null
  ingested_at: string
}

// ─── Aggregates ───────────────────────────────────────────────────────────────

export interface FarmMetricsDaily {
  metric_date: string
  canonical_farm_id: string
  farm_name: string | null
  region: string | null
  farm_type: string | null
  herd_size_band: string | null
  active_animal_count: number | null
  active_milking_cow_count: number | null
  dry_cow_count: number | null
  heifer_count: number | null
  total_milk_kg: number | null
  avg_milk_per_cow_kg: number | null
  milking_cow_pct: number | null
  records_passed: number | null
  records_auto_corrected: number | null
  records_quarantined: number | null
  data_quality_score: number | null
  run_id: string
  lineage_id: string | null
  created_at: string
}

export interface FeedCostAnalysis {
  analysis_id: string
  canonical_farm_id: string
  farm_name: string | null
  region: string | null
  farm_type: string | null
  herd_size_band: string | null
  period_year: number
  period_month: number
  total_feed_cost_usd: number | null
  total_milk_kg: number | null
  cost_per_kg_milk: number | null
  farm_cohort: string | null
  cohort_farm_count: number | null
  cohort_avg_cost_per_kg: number | null
  cohort_p25_cost_per_kg: number | null
  cohort_median_cost_per_kg: number | null
  cohort_p75_cost_per_kg: number | null
  cost_rank_in_cohort: number | null
  cost_percentile: number | null
  vs_cohort_avg_pct: number | null
  is_above_cohort: boolean | null
  pre_resolution_cost_per_kg: number | null
  ranking_changed_after_resolution: boolean | null
  run_id: string
  lineage_id: string | null
  created_at: string
}

// ─── Data Quality ─────────────────────────────────────────────────────────────

export interface DqSummary {
  summary_id: string
  run_id: string
  run_date: string
  source_system: string
  entity_type: string
  total_records: number
  passed_records: number
  auto_corrected_records: number
  quarantined_records: number
  pass_rate: number | null
  quarantine_rate: number | null
  duplicate_count: number | null
  missing_id_count: number | null
  unit_inconsistency_count: number | null
  invalid_date_count: number | null
  implausible_value_count: number | null
  schema_drift_count: number | null
  top_issue_codes: string[] | null
  created_at: string
}

export interface DqIssueLog {
  issue_id: string
  run_id: string
  source_system: string
  entity_type: string
  source_record_id: string
  rule_id: string
  rule_description: string | null
  severity: string
  disposition: string
  field_name: string | null
  original_value: string | null
  corrected_value: string | null
  reason_code: string | null
  reason_description: string | null
  sample_record: string | null
  created_at: string
}

// ─── Entity Resolution ────────────────────────────────────────────────────────

export interface EntityResolution {
  resolution_id: string
  entity_type: string
  canonical_id: string
  source_record_count: number
  source_systems: string[] | null
  source_ids: string[] | null
  match_method: string | null
  confidence_score: number | null
  match_evidence: string | null
  review_status: string
  review_decision: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  golden_record: string | null
  precision_eval: number | null
  recall_eval: number | null
  run_id: string
  lineage_id: string | null
  created_at: string
}

// ─── Governance ───────────────────────────────────────────────────────────────

export interface MetricRegistry {
  metric_id: string
  metric_name: string
  display_name: string
  business_definition: string
  unit: string
  grain: string
  allowed_dimensions: string[] | null
  allowed_filters: string[] | null
  source_tables: string[] | null
  calculation_note: string | null
  owner: string | null
  status: string
  version: string
  effective_from: string
  effective_to: string
  is_current: boolean
  caveats: string | null
  last_updated_by: string | null
  last_updated_at: string | null
}

export interface PipelineRun {
  run_id: string
  run_date: string
  started_at: string
  completed_at: string | null
  status: string
  tier: string
  total_input_rows: number | null
  total_output_rows: number | null
  bronze_rows: number | null
  silver_passed_rows: number | null
  silver_quarantined_rows: number | null
  gold_rows: number | null
  generation_duration_s: number | null
  ingestion_duration_s: number | null
  silver_duration_s: number | null
  resolution_duration_s: number | null
  gold_duration_s: number | null
  total_duration_s: number | null
  error_message: string | null
  config_snapshot: string | null
}

export interface BenchmarkResult {
  benchmark_id: string
  run_id: string
  tier: string
  run_date: string
  environment_description: string | null
  data_size_gb: number | null
  total_rows_generated: number | null
  total_rows_processed: number | null
  throughput_rows_per_s: number | null
  entity_matching_precision: number | null
  entity_matching_recall: number | null
  entity_matching_f1: number | null
  is_measured: boolean
  notes: string | null
  created_at: string
}

// ─── Lineage ──────────────────────────────────────────────────────────────────

export interface LineageLog {
  lineage_id: string
  entity_type: string
  canonical_id: string
  run_id: string
  pipeline_version: string | null
  source_systems: string[] | null
  source_record_ids: string[] | null
  transformation_steps: string[] | null
  quality_rules_applied: string[] | null
  metric_version: string | null
  query_signature: string | null
  created_at: string
}
