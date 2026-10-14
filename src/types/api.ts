/**
 * API request / response wrapper types for all 21 endpoints.
 * Imports from gold.ts for embedded Gold layer data.
 */

import type {
  DqSummary,
  DqIssueLog,
  EntityResolution,
  MetricRegistry,
  PipelineRun,
  BenchmarkResult,
  LineageLog,
  FeedCostAnalysis,
} from './gold'

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface ApiError {
  error_code: string
  message: string
  request_id?: string
  detail?: string
}

// ─── 1. GET /api/v1/compare/raw ───────────────────────────────────────────────

export interface SourceMetricValues {
  source_system: string
  run_id: string
  run_date: string
  active_animal_count: number | null
  active_milking_cow_count: number | null
  avg_milk_per_cow_kg: number | null
  total_milk_kg: number | null
  data_quality_score: number | null
  total_records: number
}

export interface MetricDisagreement {
  metric_name: string
  display_name: string
  values: Record<string, number | null>
  canonical_value: number | null
  variance_pct: number | null
}

export interface CompareRawResponse {
  farm_id: string
  run_id: string
  source_cards: SourceMetricValues[]
  disagreements: MetricDisagreement[]
}

// ─── 2. GET /api/v1/landscape ─────────────────────────────────────────────────

export interface SourceLandscapeCard {
  source_system: string
  total_farms: number
  total_animals: number
  total_customers: number
  entity_types: string[]
  identifier_types: string[]
  schema_fields: number
  time_range_start: string
  time_range_end: string
  last_ingested_at: string
  format: string
}

export interface SchemaFieldDiff {
  field_name: string
  source_a_type: string | null
  source_b_type: string | null
  source_c_type: string | null
  agreement: 'match' | 'mismatch' | 'missing'
}

export interface LandscapeResponse {
  run_id: string
  source_cards: SourceLandscapeCard[]
  schema_diffs: SchemaFieldDiff[]
}

// ─── 3. GET /api/v1/dq/scorecard ─────────────────────────────────────────────

export interface DqScorecardResponse {
  run_id: string
  summaries: DqSummary[]
}

// ─── 4. GET /api/v1/dq/issues ────────────────────────────────────────────────

export interface DqIssuesResponse {
  run_id: string
  total_count: number
  issues: DqIssueLog[]
}

// ─── 5. GET /api/v1/resolution/queue ─────────────────────────────────────────

export interface ReviewQueueResponse {
  run_id: string
  total_count: number
  pending_count: number
  auto_merged_count: number
  resolutions: EntityResolution[]
}

// ─── 6. POST /api/v1/resolution/decide ───────────────────────────────────────

export interface MatchDecisionRequest {
  resolution_id: string
  decision: 'merged' | 'split' | 'unsure' | 'rejected'
  reviewed_by: string
  notes?: string
}

export interface MatchDecisionResponse {
  resolution_id: string
  review_status: string
  review_decision: string
  reviewed_at: string
  reviewed_by: string
}

// ─── 7. GET /api/v1/entities/{type}/{id} ─────────────────────────────────────

export interface EntityDetailResponse {
  entity_type: string
  canonical_id: string
  data: Record<string, unknown>
}

// ─── 8. GET /api/v1/metrics ──────────────────────────────────────────────────

export interface MetricsListResponse {
  metrics: MetricRegistry[]
}

// ─── 9. GET /api/v1/metrics/{id}/impact ──────────────────────────────────────

export interface MetricImpactSample {
  canonical_farm_id: string
  farm_name: string
  value: number
  unit: string
  date: string
}

export interface MetricImpactResponse {
  metric_id: string
  metric_name: string
  display_name: string
  unit: string
  samples: MetricImpactSample[]
}

// ─── 10. GET /api/v1/pipeline/runs ───────────────────────────────────────────

export interface PipelineRunsResponse {
  runs: PipelineRun[]
}

// ─── 11. POST /api/v1/pipeline/runs ──────────────────────────────────────────

export interface CreatePipelineRunRequest {
  tier: string
  config?: Record<string, unknown>
}

export interface CreatePipelineRunResponse {
  run_id: string
  status: string
  started_at: string
  message: string
}

// ─── 12. GET /api/v1/benchmarks ──────────────────────────────────────────────

export interface BenchmarksResponse {
  benchmarks: BenchmarkResult[]
}

// ─── 13. GET /api/v1/lineage/metric ──────────────────────────────────────────

export interface LineageMetricResponse {
  metric_id: string
  lineage_records: LineageLog[]
}

// ─── 14. GET /api/v1/lineage/entity ──────────────────────────────────────────

export interface EntityLineageResponse {
  entity_type: string
  canonical_id: string
  lineage_records: LineageLog[]
}

// ─── 15. GET /api/v1/stream/stats ────────────────────────────────────────────

export interface StreamEvent {
  event_id: string
  timestamp: string
  source_system: string
  entity_type: string
  event_type: string
  disposition: string
  reason_code: string | null
  record_id: string
}

export interface StreamStatsResponse {
  events_per_second: number
  avg_latency_ms: number
  accepted_count: number
  auto_corrected_count: number
  quarantined_count: number
  recent_events: StreamEvent[]
  as_of: string
  mode: 'live' | 'replay'
}

// ─── 16. POST /api/v1/stream/inject ──────────────────────────────────────────

export interface InjectBatchRequest {
  source_system: string
  entity_type: string
  inject_errors: boolean
  batch_size?: number
}

export interface InjectBatchResponse {
  injected: number
  accepted: number
  auto_corrected: number
  quarantined: number
  run_id: string
}

// ─── 17. GET /api/v1/business/feed-cost ──────────────────────────────────────

export interface FeedCostResponse {
  period_year: number
  period_month: number
  analyses: FeedCostAnalysis[]
}

// ─── 18. POST /api/v1/ask ────────────────────────────────────────────────────

export interface AskRequest {
  question: string
  run_id?: string
  farm_id?: string
}

export interface AskResponse {
  question: string
  answer: string
  value: number | null
  unit: string | null
  metric_id: string | null
  metric_name: string | null
  metric_used: string | null
  display_name: string | null
  is_certified: boolean
  calculation_note: string | null
  lineage_id: string | null
  applied_filters: Record<string, string>
  data_quality_note: string | null
  is_ambiguous: boolean
  suggested_refinements: string[]
  is_unsupported: boolean
  model: string
  latency_ms: number
}

// ─── 19. POST /api/v1/onboard/propose ────────────────────────────────────────

export interface OnboardProposeRequest {
  source_name: string
  schema_fields: string[]
  sample_data?: string
  data_dictionary?: string
}

export interface ProposedFieldMapping {
  field_name: string
  detected_type: string
  sample_values: string[]
  proposed_canonical_field: string | null
  proposed_canonical_table: string | null
  confidence_pct: number
  needs_review: boolean
}

export interface ProposedQualityRule {
  rule_id: string
  rule_name: string
  description: string
  default_enabled: boolean
  applies_to: string[]
}

export interface OnboardProposeResponse {
  proposal_id: string
  source_name: string
  field_mappings: ProposedFieldMapping[]
  quality_rules: ProposedQualityRule[]
  notes: string | null
}

// ─── 20. POST /api/v1/onboard/approve ────────────────────────────────────────

export interface OnboardApproveRequest {
  proposal_id: string
  approved_mappings: Record<string, string>
  enabled_rule_ids: string[]
  reviewed_by: string
}

export interface OnboardApproveResponse {
  proposal_id: string
  status: string
  approved_at: string
  message: string
}

// ─── 21. GET /api/v1/results ─────────────────────────────────────────────────

export interface QaEvalRow {
  question: string
  expected_metric: string
  answer_metric: string
  is_correct: boolean
  is_certified: boolean
}

export interface ResultsResponse {
  benchmarks: BenchmarkResult[]
  dq_summaries: DqSummary[]
  qa_evaluation: QaEvalRow[]
  limitations: string[]
  next_steps: string[]
}

// ─── New persona-driven endpoints ────────────────────────────────────────────

export interface ProductionTrendPoint {
  month?: string
  date?: string
  total_milk_kg?: number
  avg_milk_per_cow_kg?: number
  milk_kg?: number
}

export interface FarmComparisonItem {
  farm_name: string
  canonical_farm_id: string
  avg_milk_per_cow_kg: number
  active_animals: number
}

export interface DataTrustSummary {
  matched_entities: number
  unmatched_entities: number
  quarantined_records: number
  pass_rate: number
}

export interface PipelineLastRun {
  run_id: string
  status: string
  total_input_rows: number
  total_output_rows: number
  total_duration_s: number
  completed_at: string
}

export interface OverviewResponse {
  run_id: string
  run_date: string
  total_farms: number
  total_animals: number
  total_milking_cows: number
  data_match_rate: number
  data_quality_score: number
  production_trend: ProductionTrendPoint[]
  farm_comparison: FarmComparisonItem[]
  data_trust: DataTrustSummary
  pipeline_last_run: PipelineLastRun
  ai_insights: string[]
}

export interface FarmItem {
  canonical_farm_id: string
  farm_name: string
  region: string
  country: string
  farm_type: string
  herd_size_band: string
  status: string
  active_animals: number
  milking_cows: number
  avg_milk_per_cow_kg: number
  feed_cost_per_kg_milk: number
  data_quality_score: number
  source_count: number
  last_updated: string
}

export interface FarmsListResponse {
  farms: FarmItem[]
}

export interface FarmSourceRecord {
  source_system: string
  label: string
  active_animals: number
  avg_milk_kg: number
}

export interface FarmDetail {
  canonical_farm_id: string
  farm_name: string
  region: string
  country: string
  source_records: FarmSourceRecord[]
  gold_active_animals: number
  gold_avg_milk_per_cow_kg: number
  duplicate_records_removed: number
}

export interface FarmTrendPoint {
  date: string
  total_milk_kg: number
  avg_milk_per_cow_kg: number
}

export interface FarmTrendResponse {
  farm_id: string
  days: number
  trend: FarmTrendPoint[]
}

export interface AnimalItem {
  canonical_animal_id: string
  ear_tag: string | null
  breed: string | null
  sex: string | null
  birth_date: string | null
  animal_type: string | null
  status: string
  is_milking_cow: boolean
  days_in_milk: number | null
  avg_milk_per_cow_kg: number | null
  canonical_farm_id: string
  last_event: string | null
}

export interface AnimalsListResponse {
  total: number
  limit: number
  offset: number
  animals: AnimalItem[]
}

export interface AnimalEvent {
  date: string
  type: string
  description: string
}

export interface AnimalProductionPoint {
  date: string
  milk_kg: number
}

export interface AnimalDetail extends AnimalItem {
  production_trend: AnimalProductionPoint[]
  events: AnimalEvent[]
}

// ─── Data Trust & Coverage ────────────────────────────────────────────────────

export interface CoverageRow {
  farm: string
  farm_id: string
  source_a: number | null
  source_b: number | null
  source_c: number | null
  overall: number
}

export interface ReconciliationSummary {
  total_entities: number
  matched: number
  pending_review: number
  unmatched: number
  match_rate: number
  precision_eval: number
  recall_eval: number
  note: string
}

export interface QualityIssueCategory {
  category: string
  count: number
  pct: number
  severity: string
  sources: string[]
  disposition: string
  rule: string
}

export interface CompletenessPoint {
  month: string
  completeness: number
  records: number
}

export interface CoverageWarning {
  farm: string
  farm_id: string
  issue: string
  severity: string
}

export interface DataTrustResponse {
  run_id: string
  run_date: string
  coverage_matrix: CoverageRow[]
  reconciliation: ReconciliationSummary
  quality_issues: QualityIssueCategory[]
  completeness_trend: CompletenessPoint[]
  coverage_warnings: CoverageWarning[]
}

// ─── AI Investigations ────────────────────────────────────────────────────────

export interface InvestigationNextStep {
  label: string
  route: string
}

export interface InvestigationCard {
  id: string
  type: 'production_change' | 'data_reliability' | 'cross_source_reconciliation' | 'seasonal_anomaly'
  title: string
  subtitle: string
  finding: string
  farms: string[]
  magnitude: string
  magnitude_dir: 'up' | 'down' | 'warn' | 'info'
  period: string
  records_supporting: number
  coverage: string
  limitation: string
  severity: 'high' | 'medium' | 'low' | 'info'
  next_steps: InvestigationNextStep[]
  chart_data: Record<string, unknown>[]
}

export interface InvestigationsResponse {
  run_id: string
  cards: InvestigationCard[]
  suggested_questions: string[]
}
