import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { postAsk } from '@/api'
import type { AskResponse } from '@/types/api'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  response?: AskResponse
  isPending?: boolean
}

export function useAsk() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')

  const askMutation = useMutation({
    mutationFn: postAsk,
    onSuccess: (data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.isPending
            ? { ...m, isPending: false, content: data.answer, response: data }
            : m,
        ),
      )
    },
    onError: () => {
      setMessages((prev) => prev.filter((m) => !m.isPending))
    },
  })

  function submitQuestion(question: string) {
    const trimmed = question.trim()
    if (!trimmed || askMutation.isPending) return

    const userId = `msg-${Date.now()}-user`
    const pendingId = `msg-${Date.now()}-pending`

    setMessages((prev) => [
      ...prev,
      { id: userId, role: 'user', content: trimmed },
      { id: pendingId, role: 'assistant', content: '', isPending: true },
    ])
    setInputValue('')
    askMutation.mutate({ question: trimmed })
  }

  function clearMessages() {
    setMessages([])
    setInputValue('')
  }

  return {
    messages,
    inputValue,
    setInputValue,
    submitQuestion,
    clearMessages,
    isPending: askMutation.isPending,
  }
}
