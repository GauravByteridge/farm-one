import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { FilterBar } from '@/components/FilterBar'
import { AiChatPanel } from '@/components/AiChatPanel'
import { useAppStore } from '@/stores/appStore'

export function AppShell() {
  const isChatPanelOpen = useAppStore(s => s.isChatPanelOpen)
  const setIsChatPanelOpen = useAppStore(s => s.setIsChatPanelOpen)

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />

      {/* Main content — blurs when panel is open */}
      <div
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
          isChatPanelOpen ? 'brightness-75 blur-sm pointer-events-none select-none' : ''
        }`}
      >
        <TopBar />
        <FilterBar />
        <main className="flex-1 overflow-y-auto" id="main-content" role="main">
          <Outlet />
        </main>
      </div>

      {/* Clickable overlay to close panel */}
      {isChatPanelOpen && (
        <div
          className="fixed inset-0 z-40 cursor-pointer"
          onClick={() => setIsChatPanelOpen(false)}
          aria-hidden
        />
      )}

      <AiChatPanel />
    </div>
  )
}
