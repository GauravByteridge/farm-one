import { CheckCircle, RefreshCw, XCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DispositionUI } from '@/types/app'

export interface DispositionBadgeProps {
  disposition: DispositionUI | string
  className?: string
}

const DISPOSITION_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  passed: { icon: CheckCircle, label: 'Passed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  auto_corrected: { icon: RefreshCw, label: 'Auto-corrected', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  quarantined: { icon: XCircle, label: 'Quarantined', color: 'bg-red-100 text-red-800 border-red-200' },
  flagged: { icon: AlertTriangle, label: 'Flagged', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  flagged_for_review: { icon: AlertTriangle, label: 'Flagged', color: 'bg-amber-100 text-amber-800 border-amber-200' },
}

export function DispositionBadge({ disposition, className }: DispositionBadgeProps) {
  const config = DISPOSITION_CONFIG[disposition] ?? DISPOSITION_CONFIG['flagged']

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold',
        config.color,
        className,
      )}
      aria-label={`Disposition: ${config.label}`}
    >
      <config.icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {config.label}
    </span>
  )
}
