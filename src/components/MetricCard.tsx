import { ArrowUp, ArrowDown, Minus, CheckCircle, Clock, Circle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { TrendDirection, MetricStatusUI } from '@/types/app'

export interface MetricCardProps {
  value: number | string
  label: string
  unit?: string
  trend?: TrendDirection
  qualityBadge?: MetricStatusUI
  isLoading?: boolean
  className?: string
}

const TREND_CONFIG = {
  up: { icon: ArrowUp, label: 'Trending up', color: 'text-emerald-600' },
  down: { icon: ArrowDown, label: 'Trending down', color: 'text-red-600' },
  flat: { icon: Minus, label: 'No change', color: 'text-muted-foreground' },
} as const

const QUALITY_CONFIG: Record<MetricStatusUI, { icon: React.ComponentType<{ className?: string }>, label: string, color: string }> = {
  certified: { icon: CheckCircle, label: 'Certified', color: 'text-emerald-600' },
  in_review: { icon: Clock, label: 'In Review', color: 'text-amber-600' },
  draft: { icon: Circle, label: 'Draft', color: 'text-muted-foreground' },
}

export function MetricCard({
  value,
  label,
  unit,
  trend,
  qualityBadge,
  isLoading = false,
  className,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('p-4', className)} aria-busy="true" aria-label={`Loading ${label}`}>
        <CardContent className="p-0 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    )
  }

  const trendConfig = trend ? TREND_CONFIG[trend] : null
  const qualityConfig = qualityBadge ? QUALITY_CONFIG[qualityBadge] : null

  return (
    <Card className={cn('p-4', className)} role="region" aria-label={label}>
      <CardContent className="p-0">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-foreground tabular-nums">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {trendConfig && (
            <span
              className={cn('flex items-center gap-1 text-xs font-medium', trendConfig.color)}
              aria-label={trendConfig.label}
            >
              <trendConfig.icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{trendConfig.label}</span>
            </span>
          )}
          {qualityConfig && (
            <span
              className={cn('flex items-center gap-1 text-xs font-medium', qualityConfig.color)}
              aria-label={`Metric status: ${qualityConfig.label}`}
            >
              <qualityConfig.icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{qualityConfig.label}</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
