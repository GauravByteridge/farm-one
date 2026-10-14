import type { ResultsResponse } from '@/types/api'
import { mockBenchmarks } from './pipeline'
import { mockDqScorecard } from './quality'

async function buildResults(): Promise<ResultsResponse> {
  const benchmarks = await mockBenchmarks()
  const scorecard = await mockDqScorecard()
  return {
    benchmarks: benchmarks.benchmarks,
    dq_summaries: scorecard.summaries,
    qa_evaluation: [
      { question: 'How many active milking cows are there?', expected_metric: 'active_milking_cow_count', answer_metric: 'active_milking_cow_count', is_correct: true, is_certified: true },
      { question: 'What is the avg daily milk per cow?', expected_metric: 'avg_daily_milk_per_cow', answer_metric: 'avg_daily_milk_per_cow', is_correct: true, is_certified: true },
      { question: 'Which farm has the highest feed cost?', expected_metric: 'feed_cost_per_kg_milk', answer_metric: 'feed_cost_per_kg_milk', is_correct: true, is_certified: true },
      { question: 'What is the DQ pass rate for Source B?', expected_metric: 'data_quality_pass_rate', answer_metric: 'data_quality_pass_rate', is_correct: true, is_certified: true },
    ],
    limitations: [
      'T2 (0.72B rows) and T3 (3.6B rows) benchmarks have not been run — environment not yet provisioned.',
      'Entity resolution precision and recall have only been validated at T0/T1 scale.',
      'The onboarding agent (Screen 11) is a limited prototype with deterministic mappings, not a production autonomous system.',
      'All UI data is synthetic — no real farm data has been used.',
      'Groq API integration is configured but requires an approved API key to activate.',
    ],
    next_steps: [
      'Provision Azure Databricks cluster for T2/T3 benchmark runs.',
      'Obtain Groq API key and run end-to-end Q&A evaluation with live data.',
      'Review and approve entity resolution queue (4 pending items).',
      'Connect Source D (new acquisition) via the onboarding wizard.',
      'Schedule pilot review with Meadowbrook Group stakeholders.',
    ],
  }
}

export function mockResults(): Promise<ResultsResponse> {
  return buildResults()
}
