/**
 * InlineAskAI
 *
 * A compact entry point that opens the AI chat panel.
 * - Suggestion chip click → opens panel + auto-submits question there
 * - User types + hits Ask → opens panel + submits question there
 * - No inline answers; everything happens in the right-side panel
 */

import { useState } from 'react'
import { Sparkles, Send, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'

interface InlineAskAIProps {
  suggestions?: string[]
  placeholder?: string
  context?: string
  showInput?: boolean   // false = suggestion chips only (no text input)
}

const DEFAULT_SUGGESTIONS = [
  'How many active milking cows are there?',
  'What is the average daily milk per cow?',
  'Which farm has the highest feed cost?',
  "What's the overall data quality score?",
]

export function InlineAskAI({
  suggestions = DEFAULT_SUGGESTIONS,
  placeholder = 'Ask about herd performance, quality or feed costs…',
  showInput = false,
}: InlineAskAIProps) {
  const [input, setInput] = useState('')
  const { openWithQuestion, toggleChatPanel } = useAppStore()

  function ask(q: string) {
    if (!q.trim()) return
    openWithQuestion(q.trim())
    setInput('')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#006837]/5 to-[#00a651]/5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#006837]" />
          <span className="text-sm font-semibold text-gray-800">Ask AI</span>
        </div>
        <button
          onClick={toggleChatPanel}
          className="text-[11px] text-[#006837] hover:text-[#004D28] flex items-center gap-0.5 font-medium transition-colors"
          title="Open AI chat panel"
        >
          Full chat <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Suggestion chips */}
      <div className="px-4 py-3 space-y-1.5">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Suggested questions</p>
        {suggestions.slice(0, 3).map(s => (
          <button
            key={s}
            onClick={() => ask(s)}
            className="w-full text-left text-xs bg-gray-50 hover:bg-[#E8F5EE] border border-gray-100 hover:border-[#D0EBD9] rounded-lg px-3 py-2.5 text-gray-700 transition-all flex items-center justify-between group"
          >
            <span>{s}</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-[#006837] transition-colors shrink-0 ml-2" />
          </button>
        ))}
      </div>

      {/* Input bar — only when showInput=true */}
      {showInput && (
        <div className="px-3 pb-3">
          <form
            onSubmit={e => { e.preventDefault(); ask(input) }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={placeholder}
              className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#006837] focus:ring-2 focus:ring-[#006837]/15 transition-all placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex items-center gap-1 px-3.5 py-2.5 bg-[#006837] hover:bg-[#004D28] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              Ask
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
