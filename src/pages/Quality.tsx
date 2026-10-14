import { useState, useMemo } from 'react'
import { AlertTriangle, AlertCircle, Info, RotateCcw } from 'lucide-react'
import { useDqScorecard } from '@/hooks/useDqScorecard'
import { useDqIssues } from '@/hooks/useDqIssues'
import { MetricCard } from '@/components/MetricCard'
import { DataTable } from '@/components/DataTable'
import { DispositionBadge } from '@/components/DispositionBadge'
import { SourceBadge } from '@/components/SourceBadge'
import { SlideOutDrawer } from '@/components/SlideOutDrawer'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DqSummary, DqIssueLog } from '@/types/gold'
import type { ColumnDef } from '@/types/app'

// ─── Types ────────────────────────────────────────────────────────────────────

type DqIssueRow = DqIssueLog & Record<string, unknown>

// ─── Helpers ──────────────────────────────────────────────────────────────────

function passRateStatus(rate: number | null): 'certified' | 'in_review' | 'draft' {
  if (rate == null) return 'draft'
  if (rate > 95) return 'certified'
  if (rate >= 80) return 'in_review'
  return 'draft'
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === 'error') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
        <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
        Error
      </span>
    )
  }
  if (severity === 'warning') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
        <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
        Warning
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
      <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
      Info
    </span>
  )
}

/** Aggregate DqSummary rows by source system */
function aggregateBySource(summaries: DqSummary[]): Record<string, DqSummary> {
  const agg: Record<string, DqSummary> = {}
  for (const s of summaries) {
    const k = s.source_system
    if (!agg[k]) {
      agg[k] = { ...s }
    } else {
      const a = agg[k]
      a.total_records += s.total_records
      a.passed_records += s.passed_records
      a.auto_corrected_records += s.auto_corrected_records
      a.quarantined_records += s.quarantined_records
      a.duplicate_count = (a.duplicate_count ?? 0) + (s.duplicate_count ?? 0)
      a.missing_id_count = (a.missing_id_count ?? 0) + (s.missing_id_count ?? 0)
      a.unit_inconsistency_count =
        (a.unit_inconsistency_count ?? 0) + (s.unit_inconsistency_count ?? 0)
      a.invalid_date_count =
        (a.invalid_date_count ?? 0) + (s.invalid_date_count ?? 0)
      a.implausible_value_count =
        (a.implausible_value_count ?? 0) + (s.implausible_value_count ?? 0)
      a.schema_drift_count =
        (a.schema_drift_count ?? 0) + (s.schema_drift_count ?? 0)
      a.pass_rate =
        a.total_records > 0
          ? (a.passed_records / a.total_records) * 100
          : null
      a.quarantine_rate =
        a.total_records > 0
          ? (a.quarantined_records / a.total_records) * 100
          : null
    }
  }
  return agg
}

// ─── Issue table columns ──────────────────────────────────────────────────────

const ISSUE_COLUMNS: ColumnDef<DqIssueRow>[] = [
  {
    key: 'rule_id',
    header: 'Rule ID',
    sortable: true,
    className: 'font-mono text-xs',
  },
  {
    key: 'severity',
    header: 'Severity',
    render: (v) => <SeverityBadge severity={String(v ?? '')} />,
  },
  {
    key: 'entity_type',
    header: 'Entity Type',
    sortable: true,
  },
  {
    key: 'source_system',
    header: 'Source',
    render: (v) => <SourceBadge source={String(v ?? '')} />,
  },
  {
    key: 'field_name',
    header: 'Field',
    className: 'font-mono text-xs',
    render: (v) => <span className="font-mono text-xs">{String(v ?? '—')}</span>,
  },
  {
    key: 'original_value',
    header: 'Original Value',
    className: 'font-mono text-xs max-w-[180px]',
    render: (v) => (
      <span
        className="font-mono text-xs truncate block max-w-[180px]"
        title={String(v ?? '')}
      >
        {v != null ? String(v).slice(0, 30) : '—'}
      </span>
    ),
  },
  {
    key: 'disposition',
    header: 'Disposition',
    render: (v) => <DispositionBadge disposition={String(v ?? '')} />,
  },
  {
    key: 'reason_description',
    header: 'Reason',
    render: (v) => (
      <span
        className="text-xs text-muted-foreground truncate block max-w-[240px]"
        title={String(v ?? '')}
      >
        {v != null ? String(v).slice(0, 60) : '—'}
      </span>
    ),
  },
]

// ─── Drawer content ───────────────────────────────────────────────────────────

function IssueDrawerContent({ issue }: { issue: DqIssueLog }) {
  let parsedRecord: unknown = null
  if (issue.sample_record) {
    try {
      parsedRecord = JSON.parse(issue.sample_record)
    } catch {
      parsedRecord = issue.sample_record
    }
  }

  const fields: { label: string; value: string | null }[] = [
    { label: 'Issue ID', value: issue.issue_id },
    { label: 'Run ID', value: issue.run_id },
    { label: 'Source System', value: issue.source_system },
    { label: 'Entity Type', value: issue.entity_type },
    { label: 'Source Record ID', value: issue.source_record_id },
    { label: 'Rule ID', value: issue.rule_id },
    { label: 'Rule Description', value: issue.rule_description },
    { label: 'Severity', value: issue.severity },
    { label: 'Disposition', value: issue.disposition },
    { label: 'Field Name', value: issue.field_name },
    { label: 'Original Value', value: issue.original_value },
    { label: 'Corrected Value', value: issue.corrected_value },
    { label: 'Reason Code', value: issue.reason_code },
    { label: 'Reason Description', value: issue.reason_description },
    { label: 'Created At', value: issue.created_at },
  ]

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex gap-3 text-sm">
            <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
            <span className="font-mono text-xs break-all">
              {value ?? <span className="text-muted-foreground italic">—</span>}
            </span>
          </div>
        ))}
      </div>

      {parsedRecord != null && (
        <div>
          <p className="text-sm font-semibold mb-2">Sample Record</p>
          <pre className="font-mono text-xs bg-gray-50 border p-3 rounded overflow-auto max-h-96">
            {JSON.stringify(parsedRecord, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Quality() {
  const scorecard = useDqScorecard()
  const issues = useDqIssues()

  const [filterSource, setFilterSource] = useState('all')
  const [filterEntity, setFilterEntity] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterDisposition, setFilterDisposition] = useState('all')
  const [selectedIssue, setSelectedIssue] = useState<DqIssueLog | null>(null)

  // Client-side filter
  const filteredIssues = useMemo<DqIssueRow[]>(() => {
    if (!issues.data) return []
    return issues.data.issues
      .filter((iss) => {
        if (filterSource !== 'all' && iss.source_system !== filterSource)
          return false
        if (filterEntity !== 'all' && iss.entity_type !== filterEntity)
          return false
        if (filterSeverity !== 'all' && iss.severity !== filterSeverity)
          return false
        if (filterDisposition !== 'all' && iss.disposition !== filterDisposition)
          return false
        return true
      })
      .map((iss) => iss as DqIssueRow)
  }, [issues.data, filterSource, filterEntity, filterSeverity, filterDisposition])

  // Aggregate scorecard per source
  const sourceSummaries = useMemo(
    () =>
      scorecard.data ? aggregateBySource(scorecard.data.summaries) : {},
    [scorecard.data],
  )

  // Total issue breakdown
  const totals = useMemo(() => {
    const s = Object.values(sourceSummaries)
    return {
      duplicate: s.reduce((acc, x) => acc + (x.duplicate_count ?? 0), 0),
      missing_id: s.reduce((acc, x) => acc + (x.missing_id_count ?? 0), 0),
      unit: s.reduce((acc, x) => acc + (x.unit_inconsistency_count ?? 0), 0),
      invalid_date: s.reduce((acc, x) => acc + (x.invalid_date_count ?? 0), 0),
      implausible: s.reduce(
        (acc, x) => acc + (x.implausible_value_count ?? 0),
        0,
      ),
      schema_drift: s.reduce((acc, x) => acc + (x.schema_drift_count ?? 0), 0),
    }
  }, [sourceSummaries])

  const isPageLoading = scorecard.isLoading || issues.isLoading
  const isPageError = scorecard.isError || issues.isError

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isPageLoading) {
    return (
      <div className="p-6 space-y-6" aria-busy="true" aria-label="Loading data quality">
        <Skeleton className="h-7 w-48 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
        <div className="rounded-md border p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full mb-2" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (isPageError) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4">
        <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
        <p className="text-destructive font-medium">
          Failed to load data quality information.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            void scorecard.refetch()
            void issues.refetch()
          }}
        >
          <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
          Retry
        </Button>
      </div>
    )
  }

  // ── Empty ────────────────────────────────────────────────────────────────────
  if (!scorecard.data || scorecard.data.summaries.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground py-16">
        No data quality information available.
      </div>
    )
  }

  const sources = Object.keys(sourceSummaries)

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Data Quality</h1>
        <p className="text-sm text-muted-foreground mt-1">
          DQ scorecard and issue log for run{' '}
          <span className="font-mono">{scorecard.data.run_id}</span>
        </p>
      </div>

      {/* Scorecard — 3 source columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sources.map((src) => {
          const s = sourceSummaries[src]
          const status = passRateStatus(s.pass_rate)
          return (
            <Card key={src} role="region" aria-label={`${src} quality scorecard`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold capitalize">
                    {src.replace('_', ' ')}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <SourceBadge source={src} />
                    <StatusBadge status={status} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <MetricCard
                  label="Pass Rate"
                  value={
                    s.pass_rate != null
                      ? `${s.pass_rate.toFixed(1)}%`
                      : '—'
                  }
                  qualityBadge={status}
                />
                <MetricCard
                  label="Quarantine Rate"
                  value={
                    s.quarantine_rate != null
                      ? `${s.quarantine_rate.toFixed(1)}%`
                      : '—'
                  }
                />
                <MetricCard
                  label="Auto-corrected Records"
                  value={s.auto_corrected_records}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Issue breakdown summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {(
          [
            { label: 'Duplicates', count: totals.duplicate },
            { label: 'Missing IDs', count: totals.missing_id },
            { label: 'Unit Issues', count: totals.unit },
            { label: 'Invalid Dates', count: totals.invalid_date },
            { label: 'Implausible Values', count: totals.implausible },
            { label: 'Schema Drift', count: totals.schema_drift },
          ] as { label: string; count: number }[]
        ).map(({ label, count }) => (
          <Card key={label} className="text-center p-3">
            <p className="text-2xl font-bold tabular-nums">{count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3" role="group" aria-label="Issue filters">
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-40" aria-label="Filter by source">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="source_a">Source A</SelectItem>
            <SelectItem value="source_b">Source B</SelectItem>
            <SelectItem value="source_c">Source C</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger className="w-44" aria-label="Filter by entity type">
            <SelectValue placeholder="Entity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entity Types</SelectItem>
            <SelectItem value="farm">Farm</SelectItem>
            <SelectItem value="animal">Animal</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="milk_production">Milk Production</SelectItem>
            <SelectItem value="feed_cost">Feed Cost</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-36" aria-label="Filter by severity">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDisposition} onValueChange={setFilterDisposition}>
          <SelectTrigger className="w-44" aria-label="Filter by disposition">
            <SelectValue placeholder="Disposition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dispositions</SelectItem>
            <SelectItem value="auto_corrected">Auto-corrected</SelectItem>
            <SelectItem value="quarantined">Quarantined</SelectItem>
            <SelectItem value="flagged_for_review">Flagged for Review</SelectItem>
          </SelectContent>
        </Select>

        {(filterSource !== 'all' ||
          filterEntity !== 'all' ||
          filterSeverity !== 'all' ||
          filterDisposition !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterSource('all')
              setFilterEntity('all')
              setFilterSeverity('all')
              setFilterDisposition('all')
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Issue table */}
      <DataTable<DqIssueRow>
        columns={ISSUE_COLUMNS}
        data={filteredIssues}
        emptyMessage="No issues match the current filters."
        onRowClick={(row) => setSelectedIssue(row as DqIssueLog)}
      />

      {/* Slide-out drawer */}
      <SlideOutDrawer
        open={selectedIssue !== null}
        onClose={() => setSelectedIssue(null)}
        title={selectedIssue?.rule_id ?? 'Issue Detail'}
        description={selectedIssue?.rule_description ?? undefined}
      >
        {selectedIssue && <IssueDrawerContent issue={selectedIssue} />}
      </SlideOutDrawer>
    </div>
  )
}
