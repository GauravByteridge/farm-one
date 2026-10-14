import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PipelineStage, StageStatus } from '@/types/app'

export interface PipelineDiagramProps {
  stages: PipelineStage[]
  className?: string
}

const STATUS_CONFIG: Record<StageStatus, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-muted-foreground', label: 'Pending' },
  running: { icon: Loader2, color: 'text-blue-600 animate-spin', label: 'Running' },
  completed: { icon: CheckCircle, color: 'text-emerald-600', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-red-600', label: 'Failed' },
}

export function PipelineDiagram({ stages, className }: PipelineDiagramProps) {
  return (
    <div
      className={cn('flex items-center gap-0 overflow-x-auto pb-2', className)}
      role="list"
      aria-label="Pipeline stages"
    >
      {stages.map((stage, i) => {
        const config = STATUS_CONFIG[stage.status]
        return (
          <div key={stage.name} className="flex items-center" role="listitem">
            {/* Stage box */}
            <div
              className={cn(
                'flex flex-col items-center px-4 py-3 rounded-lg border bg-card min-w-[120px]',
                stage.status === 'completed' && 'border-emerald-200 bg-emerald-50',
                stage.status === 'failed' && 'border-red-200 bg-red-50',
                stage.status === 'running' && 'border-blue-200 bg-blue-50',
                stage.status === 'pending' && 'border-border',
              )}
              aria-label={`${stage.name}: ${config.label}`}
            >
              <div className={cn('flex items-center gap-1.5 mb-1')}>
                <config.icon className={cn('h-4 w-4 shrink-0', config.color)} aria-hidden="true" />
                <span className="text-xs font-semibold text-foreground">{stage.name}</span>
              </div>
              <span className={cn('text-xs', config.color)} aria-label={`Status: ${config.label}`}>
                {config.label}
              </span>
              {stage.rowCount != null && (
                <span className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                  {stage.rowCount.toLocaleString()} rows
                </span>
              )}
              {stage.durationS != null && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {stage.durationS.toFixed(1)}s
                </span>
              )}
            </div>
            {/* Arrow connector */}
            {i < stages.length - 1 && (
              <div className="w-6 h-px bg-border flex items-center justify-center shrink-0" aria-hidden="true">
                <span className="text-muted-foreground text-xs">›</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
