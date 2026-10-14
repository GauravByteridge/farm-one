/**
 * UI-only types that have no direct Gold schema counterpart.
 */

export type AppMode = 'mock' | 'live'

export type PresentationMode = 'normal' | 'presentation'

export type TrendDirection = 'up' | 'down' | 'flat'

export type MetricStatusUI = 'certified' | 'in_review' | 'draft'

export type DispositionUI =
  | 'passed'
  | 'auto_corrected'
  | 'quarantined'
  | 'flagged'

export type SourceSystemUI = 'source_a' | 'source_b' | 'source_c'

// ─── Lineage Graph ────────────────────────────────────────────────────────────

export type LineageStage =
  | 'source'
  | 'bronze'
  | 'silver'
  | 'resolution'
  | 'gold'
  | 'metric'

export interface LineageNode {
  id: string
  label: string
  stage: LineageStage
  runId?: string
  rowCount?: number
}

export interface LineageEdge {
  from: string
  to: string
}

// ─── Pipeline Diagram ─────────────────────────────────────────────────────────

export type StageStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface PipelineStage {
  name: string
  status: StageStatus
  rowCount?: number | null
  durationS?: number | null
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export interface ColumnDef<T = Record<string, unknown>> {
  key: string
  header: string
  sortable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
  className?: string
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
  path: string
  label: string
  iconName: string
}
