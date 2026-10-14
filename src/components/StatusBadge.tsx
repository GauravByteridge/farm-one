import { CheckCircle, Clock, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MetricStatusUI } from '@/types/app'

export interface StatusBadgeProps {
  status: MetricStatusUI | string
  className?: string
}

const STATUS_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  certified: { icon: CheckCircle, label: 'Certified', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  in_review: { icon: Clock, label: 'In Review', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  draft: { icon: Circle, label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-200' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['draft']

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold',
        config.color,
        className,
      )}
      aria-label={`Status: ${config.label}`}
    >
      <config.icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {config.label}
    </span>
  )
}
