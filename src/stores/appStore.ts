import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Persona = 'global' | 'farm' | 'admin'
export type ComparisonStandard = 'vs_last_run' | 'vs_cohort' | 'vs_industry' | 'vs_previous_period'
export type DateRange = '30d' | '3m' | '12m' | '2y' | '3y' | '5y' | 'all'

export interface ScopeFilters {
  country: string
  region:  string
  farmId:  string
}

const EMPTY_SCOPE: ScopeFilters = { country: '', region: '', farmId: '' }

interface AppState {
  selectedRunId:   string
  persona:         Persona
  isChatPanelOpen: boolean
  /** Set by InlineAskAI / suggestion chips — panel reads and clears it */
  pendingQuestion: string | null

  primary:         ScopeFilters
  vsScope:         ScopeFilters
  vsSameAsPrimary: boolean
  comparison:      ComparisonStandard
  dateRange:       DateRange

  setSelectedRunId:    (v: string) => void
  setPersona:          (v: Persona) => void
  setIsChatPanelOpen:  (v: boolean) => void
  toggleChatPanel:     () => void
  /** Open the panel and queue a question to be auto-submitted */
  openWithQuestion:    (q: string) => void
  clearPendingQuestion:() => void

  setPrimary:          (f: Partial<ScopeFilters>) => void
  setVsScope:          (f: Partial<ScopeFilters>) => void
  setVsSameAsPrimary:  (v: boolean) => void
  setComparison:       (v: ComparisonStandard) => void
  setDateRange:        (v: DateRange) => void
  resetFilters:        () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedRunId:    'RUN-2024-002',
      persona:          'global',
      isChatPanelOpen:  false,
      pendingQuestion:  null,
      primary:          EMPTY_SCOPE,
      vsScope:          EMPTY_SCOPE,
      vsSameAsPrimary:  true,
      comparison:       'vs_last_run',
      dateRange:        '12m',

      setSelectedRunId:     (v) => set({ selectedRunId: v }),
      setPersona:           (v) => set({ persona: v }),
      setIsChatPanelOpen:   (v) => set({ isChatPanelOpen: v }),
      toggleChatPanel:      ()  => set((s) => ({ isChatPanelOpen: !s.isChatPanelOpen })),
      openWithQuestion:     (q) => set({ isChatPanelOpen: true, pendingQuestion: q }),
      clearPendingQuestion: ()  => set({ pendingQuestion: null }),

      setPrimary: (f) => set((s) => {
        const next = { ...s.primary, ...f }
        if (f.country !== undefined) { next.region = ''; next.farmId = '' }
        if (f.region !== undefined && f.country === undefined) next.farmId = ''
        const update: Partial<AppState> = { primary: next }
        if (s.vsSameAsPrimary) update.vsScope = next
        return update
      }),

      setVsScope: (f) => set((s) => {
        const next = { ...s.vsScope, ...f }
        if (f.country !== undefined) { next.region = ''; next.farmId = '' }
        if (f.region !== undefined && f.country === undefined) next.farmId = ''
        return { vsScope: next, vsSameAsPrimary: false }
      }),

      setVsSameAsPrimary: (v) => set((s) => ({
        vsSameAsPrimary: v,
        vsScope: v ? s.primary : s.vsScope,
      })),

      setComparison: (v) => set({ comparison: v }),
      setDateRange:  (v) => set({ dateRange: v }),
      resetFilters:  ()  => set({ primary: EMPTY_SCOPE, vsScope: EMPTY_SCOPE, vsSameAsPrimary: true }),
    }),
    { name: 'one-herd-app-state' },
  ),
)
