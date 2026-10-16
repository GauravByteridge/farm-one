import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Building2, ShieldCheck, Activity,
  MessageSquare, Home, Rabbit, Sparkles, Cpu,
  Search, BarChart2, GitMerge, Code2, CheckSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'

interface NavItem {
  path?: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  action?: 'toggleChat'
}

const GLOBAL_NAV: NavItem[] = [
  { path: '/overview', label: 'Overview',     icon: LayoutDashboard },
  { path: '/farms',    label: 'Farms',        icon: Building2 },
  { path: '/pipeline', label: 'Pipeline',     icon: Activity },
  { label: 'Ask AI',   icon: MessageSquare,   action: 'toggleChat' },
]

const FARM_NAV: NavItem[] = [
  { path: '/my-farm',  label: 'My Farm',      icon: Home },
  { path: '/animals',  label: 'Animals',      icon: Rabbit },
  { path: '/quality',  label: 'Data Quality', icon: ShieldCheck },
  { label: 'Ask AI',   icon: MessageSquare,   action: 'toggleChat' },
]

const ADMIN_NAV: NavItem[] = [
  { path: '/admin/discovery',   label: 'Schema Discovery',         icon: Search       },
  { path: '/admin/profiling',   label: 'Data Profiling',           icon: BarChart2    },
  { path: '/admin/correlation', label: 'Cross-System Correlation', icon: GitMerge     },
  { path: '/admin/etl',         label: 'ETL Generator',            icon: Code2        },
  { path: '/admin/validation',  label: 'Validation & QA',          icon: CheckSquare  },
  { path: '/admin/assistant',   label: 'AI Assistant',             icon: Sparkles     },
]

export function Sidebar() {
  const { isChatPanelOpen, toggleChatPanel } = useAppStore()
  const persona = useAppStore(s => s.persona)
  const navItems = persona === 'global' ? GLOBAL_NAV
                 : persona === 'farm'   ? FARM_NAV
                 : ADMIN_NAV
  const location = useLocation()

  return (
    <aside className="w-[220px] shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#006837]" aria-hidden />
          <span className="font-bold text-[#006837] text-lg tracking-tight">Farm One</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">Livestock Data Intelligence</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon

          // Action item — Ask AI opens right panel
          if (item.action === 'toggleChat') {
            return (
              <button
                key="ask-ai"
                onClick={toggleChatPanel}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                  isChatPanelOpen
                    ? 'bg-[#006837] text-white font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isChatPanelOpen ? 'text-white' : 'text-gray-400')} aria-hidden />
                {item.label}
                {isChatPanelOpen && (
                  <span className="ml-auto text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Open</span>
                )}
              </button>
            )
          }

          // Regular nav link
          return (
            <NavLink
              key={item.path}
              to={item.path!}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                  isActive
                    ? 'bg-[#006837] text-white font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-gray-400')} aria-hidden />
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-400">Meadowbrook Group · POC</p>
      </div>
    </aside>
  )
}
