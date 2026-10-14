import { z } from 'zod'

export type { ZodType } from 'zod'

// ─── Shared validate helper ───────────────────────────────────────────────────

export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data)
}

export * from './compare'
export * from './landscape'
export * from './quality'
export * from './resolution'
export * from './metrics'
export * from './pipeline'
export * from './lineage'
export * from './stream'
export * from './business'
export * from './ask'
export * from './onboard'
export * from './results'
