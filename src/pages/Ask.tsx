import { useRef, useEffect, KeyboardEvent } from 'react'
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAsk } from '@/hooks/useAsk'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { AskResponse } from '@/types/api'
import { useState } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  'How many active milking cows are there across all farms?',
  'What is the average daily milk per cow?',
  'Which farm has the highest feed cost per kg of milk?',
  'What is the data quality pass rate for Source B?',
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function AssistantMessage({ response }: { response: AskResponse }) {
  const [calcOpen, setCalcOpen] = useState(false)

  if (response.is_unsupported) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2"
        role="alert"
      >
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-500 shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold text-red-800">
            This question is outside the scope of certified metrics.
          </p>
        </div>
        <p className="text-sm text-red-700 leading-relaxed">{response.answer}</p>
        {response.suggested_refinements.length > 0 && (
          <div className="space-y-1 pt-1">
            <p className="text-xs font-medium text-red-700">Try instead:</p>
            <div className="flex flex-wrap gap-1">
              {response.suggested_refinements.map((r) => (
                <button
                  key={r}
                  className="text-xs bg-white border border-red-200 text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  onClick={() => {
                    /* chip click handled by parent via prop — no-op here */
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
        <MockResponseChip />
      </div>
    )
  }

  if (response.is_ambiguous) {
    return (
      <div
        className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2"
        role="alert"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold text-amber-800">
            I need clarification
          </p>
        </div>
        <p className="text-sm text-amber-700 leading-relaxed">{response.answer}</p>
        {response.suggested_refinements.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {response.suggested_refinements.map((r) => (
              <span
                key={r}
                className="text-xs bg-white border border-amber-200 text-amber-700 px-2 py-1 rounded cursor-pointer hover:bg-amber-50 transition-colors"
              >
                {r}
              </span>
            ))}
          </div>
        )}
        <MockResponseChip />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-muted bg-white p-4 space-y-3 shadow-sm">
      {/* Answer text */}
      <p className="text-sm leading-relaxed text-foreground">{response.answer}</p>

      {/* Value block */}
      {response.value != null && (
        <div className="inline-flex items-baseline gap-2 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2">
          <span className="text-2xl font-bold tabular-nums text-primary">
            {typeof response.value === 'number'
              ? response.value.toLocaleString(undefined, {
                  maximumFractionDigits: 4,
                })
              : response.value}
          </span>
          {response.unit && (
            <span className="text-sm text-muted-foreground">{response.unit}</span>
          )}
        </div>
      )}

      {/* Metric chip + certified badge */}
      <div className="flex items-center gap-2 flex-wrap">
        {response.metric_id && (
          <span className="font-mono text-xs bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded">
            {response.metric_id}
          </span>
        )}
        {response.metric_name && (
          <span className="text-xs text-muted-foreground">{response.metric_name}</span>
        )}
        {response.is_certified && (
          <StatusBadge status="certified" />
        )}
      </div>

      {/* Applied filters */}
      {Object.keys(response.applied_filters).length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground">Filters:</span>
          {Object.entries(response.applied_filters).map(([k, v]) => (
            <span
              key={k}
              className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border"
            >
              {k}: {v}
            </span>
          ))}
        </div>
      )}

      {/* Data quality note */}
      {response.data_quality_note && (
        <p className="text-xs text-muted-foreground italic flex gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-500" aria-hidden="true" />
          {response.data_quality_note}
        </p>
      )}

      {/* How was this computed — collapsible */}
      {response.calculation_note && (
        <Collapsible open={calcOpen} onOpenChange={setCalcOpen}>
          <CollapsibleTrigger asChild>
            <button
              className="flex items-center gap-1 text-xs text-primary hover:underline"
              aria-expanded={calcOpen}
            >
              {calcOpen ? (
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              )}
              How was this computed?
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-1">
              <code className="block text-xs bg-muted text-muted-foreground px-3 py-2 rounded font-mono leading-relaxed">
                {response.calculation_note}
              </code>
              {response.lineage_id && (
                <p className="text-xs text-muted-foreground">
                  Lineage:{' '}
                  <Link
                    to="/lineage"
                    className="font-mono text-primary hover:underline"
                  >
                    {response.lineage_id}
                  </Link>
                </p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <MockResponseChip />
    </div>
  )
}

function MockResponseChip() {
  return (
    <span className="inline-flex items-center text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
      MOCK RESPONSE
    </span>
  )
}

function PendingBubble() {
  return (
    <div className="rounded-xl border border-muted bg-white p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span className="text-sm">Computing answer…</span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Ask() {
  const {
    messages,
    inputValue,
    setInputValue,
    submitQuestion,
    isPending,
  } = useAsk()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitQuestion(inputValue)
    }
  }

  function handleChipClick(prompt: string) {
    setInputValue(prompt)
    submitQuestion(prompt)
  }

  const hasMessages = messages.length > 0

  return (
    <div className="p-6 flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="shrink-0 mb-4">
        <h1 className="text-xl font-bold text-foreground">Ask</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ask questions about certified metrics — answers are always backed by verified Spark
          calculations
        </p>
      </div>

      {/* Suggested prompt chips — shown before first message */}
      {!hasMessages && (
        <div className="shrink-0 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Suggested questions
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                className="text-sm bg-white border border-muted rounded-lg px-3 py-2 text-left text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                onClick={() => handleChipClick(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-2 min-h-0">
        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div
                  className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed"
                  role="comment"
                  aria-label="Your question"
                >
                  {msg.content}
                </div>
              </div>
            )
          }

          return (
            <div key={msg.id} className="flex justify-start max-w-[90%]">
              <div className="w-full">
                {msg.isPending ? (
                  <PendingBubble />
                ) : msg.response ? (
                  <AssistantMessage response={msg.response} />
                ) : null}
              </div>
            </div>
          )
        })}

        {/* Loading indicator when pending but no message slot yet */}
        {isPending && messages.every((m) => !m.isPending) && (
          <div className="flex justify-start max-w-[90%]">
            <PendingBubble />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <Card className="shrink-0 mt-4">
        <CardContent className="p-3">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about certified metrics… (Enter to send, Shift+Enter for newline)"
              className="flex-1 min-h-[2.5rem] max-h-32 resize-none text-sm"
              rows={1}
              disabled={isPending}
              aria-label="Question input"
            />
            <Button
              onClick={() => submitQuestion(inputValue)}
              disabled={!inputValue.trim() || isPending}
              size="sm"
              className="shrink-0 mb-0.5"
              aria-label="Send question"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Answers are derived from certified Spark calculations only. The LLM explains verified
            numbers — it does not compute them.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
