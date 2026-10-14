/**
 * Simplified toast hook — reducer-based, no external state library.
 * Pattern adapted from shadcn/ui's use-toast implementation.
 */

import { useState, useEffect, useCallback } from 'react'

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

type ToastActionType =
  | { type: 'ADD'; toast: ToastProps }
  | { type: 'REMOVE'; id: string }

let toastId = 0

function genId(): string {
  return String(++toastId)
}

// Module-level store (avoids context provider requirement)
let toasts: ToastProps[] = []
const listeners: Set<(t: ToastProps[]) => void> = new Set()

function dispatch(action: ToastActionType) {
  switch (action.type) {
    case 'ADD':
      toasts = [...toasts, action.toast]
      break
    case 'REMOVE':
      toasts = toasts.filter((t) => t.id !== action.id)
      break
  }
  listeners.forEach((l) => l(toasts))
}

export function toast(props: Omit<ToastProps, 'id'>): string {
  const id = genId()
  const duration = props.duration ?? 5000

  dispatch({ type: 'ADD', toast: { ...props, id } })

  if (duration > 0) {
    setTimeout(() => {
      dispatch({ type: 'REMOVE', id })
    }, duration)
  }

  return id
}

export function useToast() {
  const [state, setState] = useState<ToastProps[]>(toasts)

  const onStateChange = useCallback((updated: ToastProps[]) => {
    setState([...updated])
  }, [])

  useEffect(() => {
    listeners.add(onStateChange)
    return () => {
      listeners.delete(onStateChange)
    }
  }, [onStateChange])

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id })
  }, [])

  return { toasts: state, toast, dismiss }
}
