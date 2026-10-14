/** Reusable horizontal tab bar */
import { cn } from '@/lib/utils'

interface Tab { id: string; label: string; icon?: string }

interface TabBarProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
}

export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-6 shrink-0">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px',
            active === t.id
              ? 'border-[#006837] text-[#006837]'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300',
          )}
        >
          {t.icon && <span>{t.icon}</span>}
          {t.label}
        </button>
      ))}
    </div>
  )
}
