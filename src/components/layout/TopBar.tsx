import { useState, useRef, useEffect } from 'react'
import { Sparkles, GitCompare, Globe, Home, Check, ChevronDown } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import type { ComparisonStandard } from '@/stores/appStore'
import { cn } from '@/lib/utils'
import { useLocation, useNavigate } from 'react-router-dom'

const PAGE_TITLES: Record<string, string> = {
  '/overview':  'Overview',
  '/farms':     'Farms',
  '/quality':   'Data Quality',
  '/pipeline':  'Pipeline & Scale',
  '/ask':       'Ask AI',
  '/my-farm':   'My Farm',
  '/animals':   'Animals',
}

const COMPARISON_SHORT: Record<ComparisonStandard, string> = {
  vs_last_run:        'Last Run',
  vs_cohort:          'Cohort Avg',
  vs_industry:        'Industry',
  vs_previous_period: 'Prior Period',
}

const PERSONAS = [
  {
    id: 'global' as const,
    name: 'Global View',
    role: 'URUS Leadership',
    scope: 'All Farms · All Regions',
    icon: Globe,
    initials: 'GL',
    bg: 'bg-[#006837]',
    route: '/overview',
  },
  {
    id: 'farm' as const,
    name: 'Farm Manager',
    role: 'Farm Owner / Manager',
    scope: 'Meadowbrook Group',
    icon: Home,
    initials: 'FM',
    bg: 'bg-slate-600',
    route: '/my-farm',
  },
]

export function TopBar() {
  const { selectedRunId, persona, setPersona, isChatPanelOpen, toggleChatPanel, comparison } = useAppStore()
  const location  = useLocation()
  const navigate  = useNavigate()
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Overview'
  const [personaOpen, setPersonaOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activePerson = PERSONAS.find(p => p.id === persona) ?? PERSONAS[0]

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPersonaOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function switchPersona(id: 'global' | 'farm') {
    const p = PERSONAS.find(x => x.id === id)!
    setPersona(id)
    navigate(p.route)
    setPersonaOpen(false)
  }

  return (
    <header
      className="h-12 flex items-center justify-between px-5 border-b border-gray-200 bg-white shrink-0"
      role="banner"
    >
      {/* Page title */}
      <h2 className="text-base font-semibold text-gray-800">{pageTitle}</h2>

      {/* Right side */}
      <div className="flex items-center gap-2.5">
        {/* Comparison badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
          <GitCompare className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-semibold text-[#006837]">{COMPARISON_SHORT[comparison]}</span>
        </div>

        {/* Run ID */}
        <span className="hidden md:block font-mono text-[11px] bg-gray-50 border border-gray-200 px-2 py-1 rounded text-gray-500">
          {selectedRunId}
        </span>

        {/* Ask AI */}
        <button
          onClick={toggleChatPanel}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
            isChatPanelOpen
              ? 'bg-[#004D28] text-white shadow-md'
              : 'bg-[#006837] text-white hover:bg-[#004D28]',
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Ask AI
        </button>

        {/* Persona / Role switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setPersonaOpen(o => !o)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            aria-expanded={personaOpen}
            aria-haspopup="true"
          >
            {/* Avatar */}
            <div className={cn('h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0', activePerson.bg)}>
              {activePerson.initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{activePerson.name}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{activePerson.scope}</p>
            </div>
            <ChevronDown className={cn('h-3.5 w-3.5 text-gray-400 transition-transform', personaOpen && 'rotate-180')} />
          </button>

          {/* Dropdown */}
          {personaOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-[60] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Switch Persona</p>
              </div>
              {PERSONAS.map(p => {
                const isActive = p.id === persona
                return (
                  <button
                    key={p.id}
                    onClick={() => switchPersona(p.id)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors',
                      isActive ? 'bg-[#E8F5EE]' : 'hover:bg-gray-50',
                    )}
                  >
                    <div className={cn('h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5', p.bg)}>
                      {p.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                        {isActive && <Check className="h-3.5 w-3.5 text-[#006837] shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{p.role}</p>
                      <p className="text-[11px] text-gray-400">{p.scope}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
