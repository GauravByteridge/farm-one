import { useState } from 'react'
import { AlertTriangle, RotateCcw, Play, ChevronDown, ChevronRight } from 'lucide-react'
import { usePipeline } from '@/hooks/usePipeline'
import { useBenchmarks } from '@/hooks/useBenchmarks'
import { PipelineDiagram } from '@/components/PipelineDiagram'
import { DataTable } from '@/components/DataTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { PipelineRun, BenchmarkResult } from '@/types/gold'
import type { PipelineStage } from '@/types/app'
import type { ColumnDef } from '@/types/app'

// ─── Types ────────────────────────────────────────────────────────────────────

type PipelineRunRow = PipelineRun & Record<string, unknown>

// ─── Helpers ──────────────────────────────────────────────────────────────────

function runStatusToMetricStatus(status: string): 'certified' | 'in_review' | 'draft' {
  if (status === 'completed') return 'certified'
  if (status === 'running' || status === 'partial') return 'in_review'
  return 'draft'
}

function pipelineRunToStages(run: PipelineRun): PipelineStage[] {
  const st = (s: string) =>
    (s === 'completed' ? 'completed' : s === 'failed' ? 'failed' : 'pending') as
      PipelineStage['status']
  const runStatus = st(run.status)
  return [
    {
      name: 'Generate',
      status: runStatus,
      rowCount: run.total_input_rows,
      durationS: run.generation_duration_s,
    },
    {
      name: 'Ingest',
      status: runStatus,
      rowCount: run.bronze_rows,
      durationS: run.ingestion_duration_s,
    },
    {
      name: 'Silver QA',
      status: runStatus,
      rowCount: run.silver_passed_rows,
      durationS: run.silver_duration_s,
    },
    {
      name: 'Quarantine',
      status: runStatus,
      rowCount: run.silver_quarantined_rows,
      durationS: null,
    },
    {
      name: 'Resolution',
      status: runStatus,
      rowCount: run.total_output_rows,
      durationS: run.resolution_duration_s,
    },
    {
      name: 'Gold',
      status: runStatus,
      rowCount: run.gold_rows,
      durationS: run.gold_duration_s,
    },
  ]
}

function formatDuration(s: number | null): string {
  if (s == null) return '—'
  if (s < 60) return `${s.toFixed(1)}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${rem.toFixed(0)}s`
}

function TierBadge({ tier }: { tier: string }) {
  const colorMap: Record<string, string> = {
    T0: 'bg-gray-100 text-gray-700 border-gray-200',
    T1: 'bg-blue-100 text-blue-800 border-blue-200',
    T2: 'bg-purple-100 text-purple-800 border-purple-200',
    T3: 'bg-purple-100 text-purple-800 border-purple-200',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold',
        colorMap[tier] ?? 'bg-muted text-foreground border-border',
      )}
    >
      {tier}
    </span>
  )
}

function PlannedBadge() {
  return (
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
      Planned — not measured
    </span>
  )
}

// ─── Run detail expansion ─────────────────────────────────────────────────────

function RunDetailExpansion({ run }: { run: PipelineRun }) {
  const stages = [
    { label: 'Data Generation', value: run.generation_duration_s },
    { label: 'Ingestion', value: run.ingestion_duration_s },
    { label: 'Silver QA', value: run.silver_duration_s },
    { label: 'Entity Resolution', value: run.resolution_duration_s },
    { label: 'Gold Layer', value: run.gold_duration_s },
  ]
  return (
    <div className="px-4 py-3 bg-muted/30 border-t space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Stage Durations
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stages.map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-base font-bold tabular-nums">
              {formatDuration(value)}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      {run.config_snapshot && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Config snapshot
          </summary>
          <pre className="font-mono mt-1 bg-card border rounded p-2 overflow-x-auto">
            {JSON.stringify(JSON.parse(run.config_snapshot), null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}

// ─── Run history table columns ────────────────────────────────────────────────

const RUN_COLUMNS: ColumnDef<PipelineRunRow>[] = [
  {
    key: 'run_id',
    header: 'Run ID',
    sortable: true,
    render: (v) => (
      <span className="font-mono text-xs font-semibold">{String(v ?? '')}</span>
    ),
  },
  {
    key: 'run_date',
    header: 'Date',
    sortable: true,
  },
  {
    key: 'tier',
    header: 'Tier',
    render: (v) => <TierBadge tier={String(v ?? '')} />,
  },
  {
    key: 'status',
    header: 'Status',
    render: (v) => {
      const s = String(v ?? '')
      const mapLabel: Record<string, string> = {
        completed: 'Completed',
        failed: 'Failed',
        running: 'Running',
        partial: 'Partial',
      }
      const mapColor: Record<string, string> = {
        completed:
          'inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800',
        failed:
          'inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800',
        running:
          'inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800',
        partial:
          'inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800',
      }
      return (
        <span className={mapColor[s] ?? mapColor['partial']}>
          {mapLabel[s] ?? s}
        </span>
      )
    },
  },
  {
    key: 'total_input_rows',
    header: 'Input Rows',
    sortable: true,
    className: 'text-right',
    render: (v) => (
      <span className="font-mono text-xs tabular-nums">
        {v != null ? Number(v).toLocaleString() : '—'}
      </span>
    ),
  },
  {
    key: 'total_output_rows',
    header: 'Output Rows',
    sortable: true,
    className: 'text-right',
    render: (v) => (
      <span className="font-mono text-xs tabular-nums">
        {v != null ? Number(v).toLocaleString() : '—'}
      </span>
    ),
  },
  {
    key: 'silver_quarantined_rows',
    header: 'Quarantined',
    sortable: true,
    className: 'text-right',
    render: (v) => {
      const n = v != null ? Number(v) : null
      return (
        <span
          className={cn(
            'font-mono text-xs tabular-nums',
            n != null && n > 0 && 'text-amber-600 font-semibold',
          )}
        >
          {n != null ? n.toLocaleString() : '—'}
        </span>
      )
    },
  },
  {
    key: 'total_duration_s',
    header: 'Duration',
    sortable: true,
    render: (v) => (
      <span className="font-mono text-xs">
        {formatDuration(v != null ? Number(v) : null)}
      </span>
    ),
  },
]

// ─── Benchmark tier table ─────────────────────────────────────────────────────

function BenchmarkTable({ benchmarks }: { benchmarks: BenchmarkResult[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Benchmark Tier Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table
            className="w-full text-sm"
            aria-label="Benchmark tier results"
          >
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground uppercase tracking-wide">
                <th className="py-2 pr-4">Tier</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4 text-right">Total Rows</th>
                <th className="py-2 pr-4 text-right">Duration</th>
                <th className="py-2 pr-4 text-right">Throughput</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((b) => (
                <tr
                  key={b.benchmark_id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="py-2 pr-4">
                    <TierBadge tier={b.tier} />
                  </td>
                  <td className="py-2 pr-4 text-xs text-muted-foreground max-w-[200px]">
                    {b.is_measured
                      ? b.environment_description ?? '—'
                      : b.notes ?? '—'}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-xs tabular-nums">
                    {b.is_measured
                      ? b.total_rows_processed != null
                        ? b.total_rows_processed.toLocaleString()
                        : '—'
                      : <PlannedBadge />}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-xs">
                    {b.is_measured ? (
                      b.total_rows_processed != null &&
                      b.throughput_rows_per_s != null
                        ? formatDuration(
                            b.total_rows_processed / b.throughput_rows_per_s,
                          )
                        : '—'
                    ) : (
                      <PlannedBadge />
                    )}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-xs">
                    {b.is_measured
                      ? b.throughput_rows_per_s != null
                        ? `${b.throughput_rows_per_s.toFixed(1)} rows/s`
                        : '—'
                      : <PlannedBadge />}
                  </td>
                  <td className="py-2">
                    {b.is_measured ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        ✓ Measured
                      </span>
                    ) : (
                      <PlannedBadge />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          T2 (720M rows) and T3 (3.6B rows) are planned targets. They require a
          provisioned cluster or Azure Databricks. Results will be recorded when
          measured.
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Pipeline() {
  const { query: pipelineQuery, mutation: runMutation } = usePipeline()
  const benchmarksQuery = useBenchmarks()
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null)

  const isPageLoading = pipelineQuery.isLoading || benchmarksQuery.isLoading
  const isPageError = pipelineQuery.isError || benchmarksQuery.isError

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isPageLoading) {
    return (
      <div className="p-6 space-y-6" aria-busy="true">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (isPageError) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4">
        <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
        <p className="text-destructive font-medium">
          Failed to load pipeline data.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            void pipelineQuery.refetch()
            void benchmarksQuery.refetch()
          }}
        >
          <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
          Retry
        </Button>
      </div>
    )
  }

  // ── Empty ────────────────────────────────────────────────────────────────────
  if (!pipelineQuery.data || pipelineQuery.data.runs.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground py-16">
        No pipeline runs available.
      </div>
    )
  }

  const { runs } = pipelineQuery.data
  // Most recent run = last in array (or sort by run_date)
  const latestRun = [...runs].sort(
    (a, b) => b.run_date.localeCompare(a.run_date),
  )[0]
  const stages = pipelineRunToStages(latestRun)

  const runRows = runs.map((r) => r as PipelineRunRow)

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pipeline & Scale</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Run history, stage details, and benchmark results
          </p>
        </div>

        {/* Run Pipeline button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={() => runMutation.mutate({ tier: 'T0' })}
                  className="gap-2"
                  aria-label="Run Pipeline"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Run Pipeline
                </Button>
              </span>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Pipeline diagram — most recent run */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Latest Run:{' '}
            <span className="font-mono text-sm font-normal">
              {latestRun.run_id}
            </span>{' '}
            <TierBadge tier={latestRun.tier} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PipelineDiagram stages={stages} />
        </CardContent>
      </Card>

      {/* Run history DataTable */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Run History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Custom table with expandable rows */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Pipeline run history">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="py-2 px-4 w-6" />
                  <th className="py-2 pr-4">Run ID</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Tier</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-right">Input Rows</th>
                  <th className="py-2 pr-4 text-right">Output Rows</th>
                  <th className="py-2 pr-4 text-right">Quarantined</th>
                  <th className="py-2 pr-4 text-right">Duration</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => {
                  const isExpanded = expandedRunId === run.run_id
                  return (
                    <>
                      <tr
                        key={run.run_id}
                        className="border-b hover:bg-muted/20 cursor-pointer"
                        onClick={() =>
                          setExpandedRunId(isExpanded ? null : run.run_id)
                        }
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          setExpandedRunId(isExpanded ? null : run.run_id)
                        }
                        aria-expanded={isExpanded}
                      >
                        <td className="py-2 px-4">
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs font-semibold">
                          {run.run_id}
                        </td>
                        <td className="py-2 pr-4 text-xs">{run.run_date}</td>
                        <td className="py-2 pr-4">
                          <TierBadge tier={run.tier} />
                        </td>
                        <td className="py-2 pr-4">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold',
                              run.status === 'completed'
                                ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
                                : run.status === 'failed'
                                  ? 'border-red-200 bg-red-100 text-red-800'
                                  : 'border-amber-200 bg-amber-100 text-amber-800',
                            )}
                          >
                            {run.status}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-xs tabular-nums">
                          {run.total_input_rows?.toLocaleString() ?? '—'}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-xs tabular-nums">
                          {run.total_output_rows?.toLocaleString() ?? '—'}
                        </td>
                        <td
                          className={cn(
                            'py-2 pr-4 text-right font-mono text-xs tabular-nums',
                            (run.silver_quarantined_rows ?? 0) > 0 &&
                              'text-amber-600 font-semibold',
                          )}
                        >
                          {run.silver_quarantined_rows?.toLocaleString() ?? '—'}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-xs">
                          {formatDuration(run.total_duration_s)}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${run.run_id}-detail`} className="border-b">
                          <td colSpan={9} className="p-0">
                            <RunDetailExpansion run={run} />
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Benchmark tier table */}
      {benchmarksQuery.data && (
        <BenchmarkTable benchmarks={benchmarksQuery.data.benchmarks} />
      )}
    </div>
  )
}
