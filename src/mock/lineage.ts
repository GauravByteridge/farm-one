import type { LineageMetricResponse, EntityLineageResponse } from '@/types/api'

export function mockLineageMetric(metricId: string): Promise<LineageMetricResponse> {
  return Promise.resolve({
    metric_id: metricId,
    lineage_records: [
      {
        lineage_id: `LIN-${metricId}-SRC`,
        entity_type: 'metric',
        canonical_id: metricId,
        run_id: 'RUN-2024-002',
        pipeline_version: '1.0.0',
        source_systems: ['source_a', 'source_b', 'source_c'],
        source_record_ids: ['SRC-A-001', 'SRC-B-001', 'SRC-C-001'],
        transformation_steps: ['bronze_ingest', 'unit_normalize', 'entity_resolve', 'gold_aggregate'],
        quality_rules_applied: ['QR-UNIT-001', 'QR-DATE-003', 'QR-ID-002'],
        metric_version: '1.0',
        query_signature: 'a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5',
        created_at: '2024-06-15T09:43:00Z',
      },
      {
        lineage_id: `LIN-${metricId}-BRONZE`,
        entity_type: 'metric',
        canonical_id: metricId,
        run_id: 'RUN-2024-002',
        pipeline_version: '1.0.0',
        source_systems: ['source_a', 'source_b', 'source_c'],
        source_record_ids: null,
        transformation_steps: ['bronze_ingest'],
        quality_rules_applied: null,
        metric_version: null,
        query_signature: null,
        created_at: '2024-06-15T07:05:00Z',
      },
    ],
  })
}

export function mockEntityLineage(entityType: string, canonicalId: string): Promise<EntityLineageResponse> {
  return Promise.resolve({
    entity_type: entityType,
    canonical_id: canonicalId,
    lineage_records: [
      {
        lineage_id: `LIN-${canonicalId}-001`,
        entity_type: entityType,
        canonical_id: canonicalId,
        run_id: 'RUN-2024-002',
        pipeline_version: '1.0.0',
        source_systems: ['source_a', 'source_b'],
        source_record_ids: ['SRC-A-001', 'SRC-B-001'],
        transformation_steps: ['bronze_ingest', 'entity_resolve'],
        quality_rules_applied: ['QR-ID-002'],
        metric_version: null,
        query_signature: null,
        created_at: '2024-06-15T08:30:00Z',
      },
    ],
  })
}
