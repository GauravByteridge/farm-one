/**
 * MOCK MODE — no backend required.
 * Returns static data matching InvestigationsResponse shape.
 */
import type { InvestigationsResponse } from '@/types/api'

const MOCK_INVESTIGATIONS: InvestigationsResponse = {
  run_id: 'RUN-2024-002',
  cards: [
    {
      id: 'INV-001',
      type: 'production_change',
      title: 'Hillside Ranch — Sustained Milk Yield Decline',
      subtitle: '−12.4% vs 90-day baseline · 10 consecutive weeks',
      finding: 'Hillside Ranch shows a 12.4% decline in avg milk/cow/day vs its 90-day baseline. Feed delivery dropped 9% below target in weeks 6–8 (Scale 2 calibration). SCC rose above 200k on 18% of cows vs 9% prior period. Source B data gap (14.3% missing) may understate the true decline.',
      farms: ['FARM-00203'],
      magnitude: '−12.4%',
      magnitude_dir: 'down',
      period: 'Apr – Jun 2024',
      records_supporting: 3240,
      coverage: '85.7%',
      limitation: 'Source B only 85.7% complete for this farm. Decline may be understated.',
      severity: 'high',
      next_steps: [
        { label: 'View farm detail',      route: '/farms' },
        { label: 'Ask AI about Hillside', route: '/ask'   },
      ],
      chart_data: Array.from({ length: 12 }, (_, i) => ({
        week: `W${i + 1}`,
        actual: parseFloat((28.4 - (i >= 6 ? (i - 5) * 0.4 : 0) + Math.sin(i * 0.5) * 0.5).toFixed(1)),
        baseline: 28.4,
      })),
    },
    {
      id: 'INV-002',
      type: 'data_reliability',
      title: 'Source B Quarantine Rate 3× Industry Norm',
      subtitle: '3.5% quarantine rate vs 1.2% Source C average',
      finding: 'Source B (FarmCore ERP) has the highest quarantine rate at 3.5% — nearly 3× Source C\'s 1.2%. Root cause: duplicate animal records ingested across multiple batch runs (18 duplicates), and 24 records missing required identifiers. Unit inconsistency (lbs vs kg) affected 31 records.',
      farms: ['FARM-00142', 'FARM-00203', 'FARM-00348'],
      magnitude: '3.5%',
      magnitude_dir: 'warn',
      period: 'RUN-2024-002',
      records_supporting: 1215,
      coverage: '91.4%',
      limitation: 'Assessment from single run. Pattern should be confirmed over 3+ runs.',
      severity: 'medium',
      next_steps: [
        { label: 'View data quality', route: '/quality' },
        { label: 'View pipeline',     route: '/pipeline' },
      ],
      chart_data: [
        { source: 'Source A', quarantine_pct: 1.8, pass_pct: 98.2 },
        { source: 'Source B', quarantine_pct: 3.5, pass_pct: 96.5 },
        { source: 'Source C', quarantine_pct: 1.2, pass_pct: 98.8 },
      ],
    },
    {
      id: 'INV-003',
      type: 'cross_source_reconciliation',
      title: 'Active Animal Count — 246-Cow Source Disagreement',
      subtitle: 'Source A: 1,920 · Source B: 1,674 · Gold: 1,842',
      finding: 'A 246-cow discrepancy exists between Source A (1,920) and Source B (1,674). Entity resolution reconciled to a Gold count of 1,842 after removing 97 duplicates and resolving 4 split records manually. Without resolution the published count would be wrong by up to 13%.',
      farms: ['FARM-00101', 'FARM-00267', 'FARM-00452'],
      magnitude: '246 cows',
      magnitude_dir: 'warn',
      period: 'As of 2024-06-15',
      records_supporting: 14820,
      coverage: '94.1%',
      limitation: '4 records required manual review — risk of recurrence if source batch changes.',
      severity: 'medium',
      next_steps: [
        { label: 'Review resolution queue', route: '/overview' },
        { label: 'Ask AI',                  route: '/ask'      },
      ],
      chart_data: [
        { source: 'Source A', count: 1920 },
        { source: 'Source B', count: 1674 },
        { source: 'Source C', count: 1901 },
        { source: 'Gold',     count: 1842 },
      ],
    },
    {
      id: 'INV-004',
      type: 'seasonal_anomaly',
      title: 'Heat Stress Alert — THI Above 68 on 12 of 14 Days',
      subtitle: 'UK farms at elevated production risk · projected −4–6% yield',
      finding: 'Temperature-Humidity Index has exceeded the 68 threshold on 12 of the last 14 days across UK farms. Historical correlation shows −4 to −6% milk yield impact when THI > 68 sustains for >10 days. Green Valley and Valley View most exposed (higher milking cow density).',
      farms: ['FARM-00101', 'FARM-00267', 'FARM-00312'],
      magnitude: '−5% est.',
      magnitude_dir: 'down',
      period: 'Jun 1–14, 2024',
      records_supporting: 840,
      coverage: '97.2%',
      limitation: 'THI from regional weather station — micro-climate variation within farm not captured.',
      severity: 'low',
      next_steps: [
        { label: 'View herd & milk', route: '/overview' },
      ],
      chart_data: Array.from({ length: 14 }, (_, i) => ({
        day: `Jun ${i + 1}`,
        thi: parseFloat((66 + Math.sin(i * 0.6) * 4 + (i >= 4 ? 4 : 0)).toFixed(1)),
        threshold: 68,
      })),
    },
  ],
  suggested_questions: [
    'Why did milk yield decline on Hillside Ranch?',
    'Which farms have feed costs above their cohort average?',
    'What is the farm-wide margin per cow?',
    'Compare farm performance accounting for data coverage',
    "What's the overall data quality across all sources?",
  ],
}

export async function fetchInvestigations(): Promise<InvestigationsResponse> {
  await new Promise(r => setTimeout(r, 350))
  return MOCK_INVESTIGATIONS
}
