import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, CheckCircle2, Circle, Play, Trash2 } from 'lucide-react'

interface AdminMessage {
  id: string
  role: 'user' | 'assistant'
  text?: string
  value?: string
  unit?: string
  answer?: string
  sources?: string[]
}

const INITIAL_MESSAGES: AdminMessage[] = [
  {
    id: '1',
    role: 'user',
    text: 'What is the milk production trend across all farms?',
  },
  {
    id: '2',
    role: 'assistant',
    value: '+8.4%',
    unit: 'vs prior 12 months',
    answer:
      'Across all 5 farms, milk production has grown 8.4% year-over-year. Farm One leads with +14.2% growth, driven by herd expansion from 380 to 430 cows in Q3 2023. Green Valley shows steady +6.1% growth. Hillside Ranch is the outlier at −12.4% due to confirmed feed delivery issues and SCC elevation in Pens 2 and 4. Overall Gold-layer production reached 2.84M kg for the trailing 12 months.',
    sources: ['PostgreSQL', 'MongoDB', 'CSV'],
  },
  {
    id: '3',
    role: 'user',
    text: 'Which source has the best data quality?',
  },
  {
    id: '4',
    role: 'assistant',
    value: '96.2%',
    unit: 'PostgreSQL pass rate',
    answer:
      'PostgreSQL (Feed Management System) has the highest data quality at 96.2% pass rate across 3 tables and ~1.2M records. Key strengths: consistent date format (ISO 8601), complete farm_id coverage, and low null rates. MongoDB scores 91.4% — main issues are 8.2% null SCC values and mixed unit reporting (litres vs kg) in 31 records. CSV sources score 88.3% with the highest rate of missing identifiers. Recommend addressing MongoDB\'s SCC null issue as the highest-priority data quality action.',
    sources: ['PostgreSQL', 'MongoDB', 'CSV'],
  },
]

const SUGGESTED_CHIPS = [
  'Show schema differences',
  'Which entities failed to match?',
  'Generate farm performance summary',
  'What are the top data quality issues?',
]

const DATA_SOURCES = [
  { id: 'postgres', label: 'PostgreSQL',    dotColor: 'bg-[#006837]' },
  { id: 'mongodb',  label: 'MongoDB',       dotColor: 'bg-[#006837]' },
  { id: 'mssql',    label: 'MS SQL Server', dotColor: 'bg-amber-400'  },
  { id: 'csv',      label: 'CSV Files',     dotColor: 'bg-[#006837]' },
]

export default function AdminAssistant() {
  const [messages, setMessages] = useState<AdminMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [sources, setSources] = useState<Set<string>>(new Set(DATA_SOURCES.map(s => s.id)))
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function toggleSource(id: string) {
    setSources(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSend(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMsg: AdminMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmed,
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    setTimeout(() => {
      const aiMsg: AdminMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        answer: `I've analyzed your question across all connected data sources. Based on the current Gold-layer data from PostgreSQL, MongoDB, and CSV sources: "${trimmed}" — the latest metrics show strong data consistency across farms with an overall quality score of 94.1%. All key business rules are passing validation.`,
        sources: ['PostgreSQL', 'MongoDB', 'CSV'],
      }
      setMessages(prev => [...prev, aiMsg])
    }, 800)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSend(input)
  }

  return (
    <div className="flex gap-0 h-full overflow-hidden">
      {/* Left sidebar */}
      <div className="w-[260px] shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin AI Assistant</p>
        </div>

        {/* Data Sources */}
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Data Sources</p>
          <div className="space-y-2.5">
            {DATA_SOURCES.map(src => (
              <label key={src.id} className="flex items-center gap-2.5 cursor-pointer">
                <span className={`h-2 w-2 rounded-full shrink-0 ${src.dotColor}`} />
                <input
                  type="checkbox"
                  checked={sources.has(src.id)}
                  onChange={() => toggleSource(src.id)}
                  className="h-4 w-4 accent-[#006837]"
                />
                <span className="text-sm text-gray-700">{src.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Workflow */}
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Workflow</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#006837] shrink-0" />
              <span className="text-sm text-gray-700">Analysis Report</span>
              <span className="ml-auto text-[10px] bg-[#E8F5EE] text-[#006837] px-1.5 py-0.5 rounded-full font-semibold">Done</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Circle className="h-4 w-4 text-gray-300 shrink-0" />
              <span className="text-sm text-gray-400">ETL Script</span>
              <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-semibold">Pending</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 space-y-2">
          <button className="bg-[#006837] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#004D28] transition-colors w-full flex items-center justify-center gap-2">
            <Play className="h-4 w-4" />
            Run Full Analysis
          </button>
          <button className="border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold w-full flex items-center justify-center gap-2 transition-colors">
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Right main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 bg-white shrink-0">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#006837]" />
            AI Assistant
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Ask questions across all connected data sources</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => (
            <div key={msg.id}>
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="bg-[#006837] text-white rounded-xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="border border-[#006837]/20 bg-[#E8F5EE]/30 rounded-xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    {msg.value && (
                      <div className="mb-2">
                        <span className="text-2xl font-bold text-[#006837]">{msg.value}</span>
                        <span className="text-xs text-gray-500 ml-2">{msg.unit}</span>
                      </div>
                    )}
                    {msg.answer && (
                      <p className="text-sm text-gray-700 leading-relaxed">{msg.answer}</p>
                    )}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {msg.sources.map(src => (
                          <span
                            key={src}
                            className="bg-[#E8F5EE] text-[#006837] px-2 py-0.5 rounded-full text-xs font-semibold"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested chips */}
        <div className="flex flex-wrap gap-2 px-5 pb-3 shrink-0">
          {SUGGESTED_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="text-xs border border-gray-200 bg-white hover:bg-[#E8F5EE] hover:border-[#006837] hover:text-[#006837] px-3 py-1.5 rounded-full cursor-pointer transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="shrink-0 border-t border-gray-200 bg-white p-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your data sources…"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006837]"
          />
          <button
            onClick={() => handleSend(input)}
            className="bg-[#006837] text-white px-3 py-2 rounded-lg hover:bg-[#004D28] transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
