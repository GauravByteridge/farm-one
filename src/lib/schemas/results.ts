import { z } from 'zod'
import { BenchmarkResultSchema } from './pipeline'
import { DqSummarySchema } from './quality'

export const QaEvalRowSchema = z.object({
  question: z.string(),
  expected_metric: z.string(),
  answer_metric: z.string(),
  is_correct: z.boolean(),
  is_certified: z.boolean(),
})

export const ResultsSchema = z.object({
  benchmarks: z.array(BenchmarkResultSchema),
  dq_summaries: z.array(DqSummarySchema),
  qa_evaluation: z.array(QaEvalRowSchema),
  limitations: z.array(z.string()),
  next_steps: z.array(z.string()),
})
