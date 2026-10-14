// ─── Source Systems ──────────────────────────────────────────────────────────

export const SOURCE_SYSTEMS = ['source_a', 'source_b', 'source_c'] as const
export type SourceSystem = (typeof SOURCE_SYSTEMS)[number]

export const SOURCE_SYSTEM_LABELS: Record<SourceSystem, string> = {
  source_a: 'Source A',
  source_b: 'Source B',
  source_c: 'Source C',
}

// ─── Entity Types ─────────────────────────────────────────────────────────────

export const ENTITY_TYPES = [
  'farm',
  'animal',
  'customer',
  'milk_production',
  'feed_cost',
] as const
export type EntityType = (typeof ENTITY_TYPES)[number]

// ─── DQ Severities ───────────────────────────────────────────────────────────

export const DQ_SEVERITIES = ['error', 'warning', 'info'] as const
export type DqSeverity = (typeof DQ_SEVERITIES)[number]

// ─── Dispositions ─────────────────────────────────────────────────────────────

export const DISPOSITIONS = [
  'passed',
  'auto_corrected',
  'quarantined',
  'flagged_for_review',
] as const
export type Disposition = (typeof DISPOSITIONS)[number]

// ─── Metric Statuses ──────────────────────────────────────────────────────────

export const METRIC_STATUSES = ['draft', 'in_review', 'certified'] as const
export type MetricStatus = (typeof METRIC_STATUSES)[number]

// ─── Pipeline Statuses ────────────────────────────────────────────────────────

export const PIPELINE_STATUSES = [
  'running',
  'completed',
  'failed',
  'partial',
] as const
export type PipelineStatus = (typeof PIPELINE_STATUSES)[number]

// ─── Tier Labels ──────────────────────────────────────────────────────────────

export const TIER_LABELS: Record<string, string> = {
  T0: 'T0 — Logic Validation',
  T1: 'T1 — Scale Measurement',
  T2: 'T2 — 0.72B Rows (Target)',
  T3: 'T3 — 3.6B Rows (Stress)',
}

// ─── Review Statuses ─────────────────────────────────────────────────────────

export const REVIEW_STATUSES = [
  'auto_merged',
  'pending_review',
  'reviewed',
] as const
export type ReviewStatus = (typeof REVIEW_STATUSES)[number]

// ─── Canonical Farm IDs ───────────────────────────────────────────────────────

export const CANONICAL_FARM_IDS = [
  'FARM-00101',
  'FARM-00142',
  'FARM-00203',
  'FARM-00267',
  'FARM-00312',
] as const
export type CanonicalFarmId = (typeof CANONICAL_FARM_IDS)[number]

export const FARM_NAMES: Record<CanonicalFarmId, string> = {
  'FARM-00101': 'Green Valley Dairy',
  'FARM-00142': 'Sunrise Farm',
  'FARM-00203': 'Hillside Ranch',
  'FARM-00267': 'Valley View Farm',
  'FARM-00312': 'Blue Ridge Farm',
}
