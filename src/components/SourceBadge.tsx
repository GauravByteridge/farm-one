import { cn } from '@/lib/utils'
import type { SourceSystemUI } from '@/types/app'

export interface SourceBadgeProps {
  source: SourceSystemUI | string
  className?: string
}

const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
  source_a: { label: 'Source A', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  source_b: { label: 'Source B', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  source_c: { label: 'Source C', color: 'bg-teal-100 text-teal-800 border-teal-200' },
}

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[source] ?? { label: source, color: 'bg-muted text-foreground border-border' }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold',
        config.color,
        className,
      )}
      aria-label={`Data source: ${config.label}`}
    >
      {config.label}
    </span>
  )
}
