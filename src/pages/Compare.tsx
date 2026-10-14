import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import { useCompare } from '@/hooks/useCompare'
import { MetricCard } from '@/components/MetricCard'
import { SourceBadge } from '@/components/SourceBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SourceMetricValues } from '@/types/api'

// ─── Disagreement detection ───────────────────────────────────────────────────

/**
 * Returns true if any of the tracked metrics has a range of more than 1% across
 * all source cards. When true, ALL cards are shown with the amber DISAGREES badge
 * because there is no single canonical value the sources agree on.
 */
function hasAnyDisagreement(cards: SourceMetricValues[]): boolean {
  const metrics: (keyof SourceMetricValues)[] = [
    'active_animal_count',
    'active_milking_cow_count',
    'avg_milk_per_cow_kg',
  ]
  return metrics.some((m) => {
    const vals = cards
      .map((c) => c[m])
      .filter((v): v is number => typeof v === 'number')
    if (vals.length < 2) return false
    const max = Math.max(...vals)
    const min = Math.min(...vals)
    return max > 0 && (max - min) / max > 0.01
  })
}

// ─── SourceCard ───────────────────────────────────────────────────────────────

interface SourceCardProps {
  card: SourceMetricValues
  disagrees: boolean
}

function SourceCard({ card, disagrees }: SourceCardProps) {
  return (
    <Card
      className={cn(
        'flex-1 min-w-[260px]',
        disagrees && 'border-amber-400 border-2',
      )}
      role="region"
      aria-label={`${card.source_system} data card`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold capitalize">
            {card.source_system.replace('_', ' ')}
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <SourceBadge source={card.source_system} />
            {disagrees && (
              <span
                className="inline-flex items-center gap-1 rounded-md border border-amber-400 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800"
                aria-label="This source disagrees with others"
              >
                <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
                DISAGREES
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Run: <span className="font-mono">{card.run_id}</span> · {card.run_date}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <MetricCard
          label="Active Animals"
          value={card.active_animal_count ?? '—'}
          unit="animals"
        />
        <MetricCard
          label="Active Milking Cows"
          value={card.active_milking_cow_count ?? '—'}
          unit="cows"
        />
        <MetricCard
          label="Avg Daily Milk per Cow"
          value={
            typeof card.avg_milk_per_cow_kg === 'number'
              ? card.avg_milk_per_cow_kg.toFixed(1)
              : '—'
          }
          unit="kg/cow/day"
        />
        <div className="border-t pt-3 text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Total Records</span>
            <span className="font-medium tabular-nums">
              {card.total_records.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>DQ Score</span>
            <span className="font-medium tabular-nums">
              {card.data_quality_score != null
                ? `${card.data_quality_score.toFixed(1)}%`
                : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Unit of Measurement</span>
            <span className="font-medium">kg</span>
          </div>
          <div className="flex justify-between">
            <span>Data Freshness</span>
            <span className="font-medium">{card.run_date}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Compare() {
  const { data, isLoading, isError, refetch } = useCompare()
  const [explanationOpen, setExplanationOpen] = useState(false)

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 space-y-6" aria-busy="true" aria-label="Loading source comparison">
        <div>
          <Skeleton className="h-7 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="flex-1 p-4">
              <Skeleton className="h-5 w-1/2 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4">
        <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
        <p className="text-destructive font-medium">
          Failed to load source comparison data.
        </p>
        <Button variant="outline" onClick={() => void refetch()}>
          <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
          Retry
        </Button>
      </div>
    )
  }

  // ── Empty ────────────────────────────────────────────────────────────────────
  if (!data || data.source_cards.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground py-16">
        No source comparison data available.
      </div>
    )
  }

  const anyDisagreement = hasAnyDisagreement(data.source_cards)

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-foreground leading-snug">
          How many active cows do we have, and what is the average daily milk per
          cow?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          3 sources — see why they disagree
        </p>
      </div>

      {/* Source cards — stack on mobile, 3-col on desktop */}
      <div className="flex flex-col md:flex-row gap-4">
        {data.source_cards.map((card) => (
          <SourceCard
            key={card.source_system}
            card={card}
            disagrees={anyDisagreement}
          />
        ))}
      </div>

      {/* Why do they differ? — collapsible */}
      <Collapsible open={explanationOpen} onOpenChange={setExplanationOpen}>
        <div className="rounded-lg border bg-card overflow-hidden">
          <CollapsibleTrigger
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/50 transition-colors"
            aria-expanded={explanationOpen}
          >
            <span>Why do they differ?</span>
            {explanationOpen ? (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-3 border-t space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-1">
                  Different animal identifier systems
                </p>
                <p>
                  Source A uses ear tags, Source B uses EIDs (electronic
                  identifiers), and Source C uses official registration numbers.
                  When the same animal appears under different identifiers in
                  different sources, it may be counted multiple times or missed
                  entirely during ingestion.
                </p>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-1">
                  Duplicate records in Source B
                </p>
                <p>
                  Source B contains fewer animals than the other sources.
                  Investigation indicates duplicate records from a prior batch
                  upload that were quarantined, reducing the active count below
                  expected levels.
                </p>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-1">
                  Unit inconsistencies in Source C
                </p>
                <p>
                  Source C originally reported milk volumes in pounds (lb) rather
                  than kilograms. The pipeline auto-corrected these to kg, but a
                  small number of records had implausible conversion results and
                  were flagged for review, slightly inflating the apparent milk
                  yield.
                </p>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-1">
                  Different definitions of "active"
                </p>
                <p>
                  Source A counts animals active as of today's date. Source B
                  counts animals active as of the last data submission (1-day lag).
                  Source C includes animals flagged as "in transition" that may be
                  entering or leaving the herd, inflating its count relative to the
                  others.
                </p>
              </div>

              {data.disagreements.length > 0 && (
                <div className="mt-2 p-3 rounded-md bg-amber-50 border border-amber-200">
                  <p className="font-semibold text-amber-800 text-xs uppercase tracking-wide mb-2">
                    Disagreement Summary
                  </p>
                  <div className="space-y-1">
                    {data.disagreements.map((d) => (
                      <div
                        key={d.metric_name}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-amber-700">{d.display_name}</span>
                        <span className="font-medium text-amber-800">
                          {d.variance_pct?.toFixed(1)}% variance
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}
