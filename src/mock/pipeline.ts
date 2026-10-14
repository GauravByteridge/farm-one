import type { PipelineRunsResponse, BenchmarksResponse, CreatePipelineRunResponse } from '@/types/api'

const runsData: PipelineRunsResponse = {
  runs: [
    {
      run_id: 'RUN-2024-001',
      run_date: '2024-05-01',
      started_at: '2024-05-01T08:00:00Z',
      completed_at: '2024-05-01T08:14:32Z',
      status: 'completed',
      tier: 'T0',
      total_input_rows: 3500,
      total_output_rows: 3421,
      bronze_rows: 3500,
      silver_passed_rows: 3298,
      silver_quarantined_rows: 79,
      gold_rows: 3421,
      generation_duration_s: 12.4,
      ingestion_duration_s: 45.2,
      silver_duration_s: 88.7,
      resolution_duration_s: 124.3,
      gold_duration_s: 98.4,
      total_duration_s: 872.0,
      error_message: null,
      config_snapshot: JSON.stringify({ tier: 'T0', num_farms: 5, rows_per_farm: 700, sources: ['source_a', 'source_b', 'source_c'] }),
    },
    {
      run_id: 'RUN-2024-002',
      run_date: '2024-06-15',
      started_at: '2024-06-15T07:00:00Z',
      completed_at: '2024-06-15T09:42:18Z',
      status: 'completed',
      tier: 'T1',
      total_input_rows: 35000,
      total_output_rows: 34218,
      bronze_rows: 35000,
      silver_passed_rows: 33042,
      silver_quarantined_rows: 782,
      gold_rows: 34218,
      generation_duration_s: 118.5,
      ingestion_duration_s: 486.2,
      silver_duration_s: 892.4,
      resolution_duration_s: 1247.8,
      gold_duration_s: 984.1,
      total_duration_s: 9138.0,
      error_message: null,
      config_snapshot: JSON.stringify({ tier: 'T1', num_farms: 5, rows_per_farm: 7000, sources: ['source_a', 'source_b', 'source_c'] }),
    },
  ],
}

const benchmarksData: BenchmarksResponse = {
  benchmarks: [
    {
      benchmark_id: 'BENCH-T0-001',
      run_id: 'RUN-2024-001',
      tier: 'T0',
      run_date: '2024-05-01',
      environment_description: 'Windows 11, 32GB RAM, Spark 3.5.1, 8 cores, Delta Lake OSS 3.2',
      data_size_gb: 0.004,
      total_rows_generated: 3500,
      total_rows_processed: 3421,
      throughput_rows_per_s: 4.0,
      entity_matching_precision: 0.97,
      entity_matching_recall: 0.94,
      entity_matching_f1: 0.955,
      is_measured: true,
      notes: 'T0 logic validation run. All core pipeline stages verified end-to-end.',
      created_at: '2024-05-01T08:15:00Z',
    },
    {
      benchmark_id: 'BENCH-T1-001',
      run_id: 'RUN-2024-002',
      tier: 'T1',
      run_date: '2024-06-15',
      environment_description: 'Windows 11, 32GB RAM, Spark 3.5.1, 8 cores, Delta Lake OSS 3.2',
      data_size_gb: 0.042,
      total_rows_generated: 35000,
      total_rows_processed: 34218,
      throughput_rows_per_s: 3.8,
      entity_matching_precision: 0.962,
      entity_matching_recall: 0.938,
      entity_matching_f1: 0.950,
      is_measured: true,
      notes: 'T1 scale measurement. Throughput stable; memory pressure observed above 20k entities.',
      created_at: '2024-06-15T09:43:00Z',
    },
    {
      benchmark_id: 'BENCH-T2-PLAN',
      run_id: 'RUN-2024-002',
      tier: 'T2',
      run_date: '2024-06-15',
      environment_description: null,
      data_size_gb: null,
      total_rows_generated: null,
      total_rows_processed: null,
      throughput_rows_per_s: null,
      entity_matching_precision: null,
      entity_matching_recall: null,
      entity_matching_f1: null,
      is_measured: false,
      notes: 'T2 (0.72B rows) — planned. Requires provisioned cluster or Azure Databricks.',
      created_at: '2024-06-15T09:43:00Z',
    },
    {
      benchmark_id: 'BENCH-T3-PLAN',
      run_id: 'RUN-2024-002',
      tier: 'T3',
      run_date: '2024-06-15',
      environment_description: null,
      data_size_gb: null,
      total_rows_generated: null,
      total_rows_processed: null,
      throughput_rows_per_s: null,
      entity_matching_precision: null,
      entity_matching_recall: null,
      entity_matching_f1: null,
      is_measured: false,
      notes: 'T3 (3.6B rows) — stress run. Planned for provisioned Azure Databricks cluster.',
      created_at: '2024-06-15T09:43:00Z',
    },
  ],
}

export function mockPipelineRuns(): Promise<PipelineRunsResponse> {
  return Promise.resolve(runsData)
}

export function mockBenchmarks(): Promise<BenchmarksResponse> {
  return Promise.resolve(benchmarksData)
}

export function mockCreatePipelineRun(): Promise<CreatePipelineRunResponse> {
  return Promise.resolve({
    run_id: `RUN-${Date.now()}`,
    status: 'running',
    started_at: new Date().toISOString(),
    message: 'Pipeline run started. Connect backend to trigger a real run.',
  })
}
