import type { CompareRawResponse } from '@/types/api'

// Source A: 1250, Source B: 1189, Source C: 1312 active animals (deliberate disagreement)
const data: CompareRawResponse = {
  farm_id: 'ALL',
  run_id: 'RUN-2024-002',
  source_cards: [
    {
      source_system: 'source_a',
      run_id: 'RUN-2024-002',
      run_date: '2024-06-15',
      active_animal_count: 1250,
      active_milking_cow_count: 842,
      avg_milk_per_cow_kg: 27.4,
      total_milk_kg: 23074.8,
      data_quality_score: 94.2,
      total_records: 1280,
    },
    {
      source_system: 'source_b',
      run_id: 'RUN-2024-002',
      run_date: '2024-06-15',
      active_animal_count: 1189,
      active_milking_cow_count: 798,
      avg_milk_per_cow_kg: 26.8,
      total_milk_kg: 21386.4,
      data_quality_score: 91.5,
      total_records: 1215,
    },
    {
      source_system: 'source_c',
      run_id: 'RUN-2024-002',
      run_date: '2024-06-15',
      active_animal_count: 1312,
      active_milking_cow_count: 889,
      avg_milk_per_cow_kg: 28.1,
      total_milk_kg: 24980.9,
      data_quality_score: 96.8,
      total_records: 1340,
    },
  ],
  disagreements: [
    {
      metric_name: 'active_animal_count',
      display_name: 'Active Animals',
      values: { source_a: 1250, source_b: 1189, source_c: 1312 },
      canonical_value: 1250,
      variance_pct: 10.3,
    },
    {
      metric_name: 'active_milking_cow_count',
      display_name: 'Active Milking Cows',
      values: { source_a: 842, source_b: 798, source_c: 889 },
      canonical_value: 842,
      variance_pct: 11.4,
    },
    {
      metric_name: 'avg_milk_per_cow_kg',
      display_name: 'Avg Milk per Cow (kg)',
      values: { source_a: 27.4, source_b: 26.8, source_c: 28.1 },
      canonical_value: 27.4,
      variance_pct: 4.9,
    },
  ],
}

export function mockCompareRaw(): Promise<CompareRawResponse> {
  return Promise.resolve(data)
}
