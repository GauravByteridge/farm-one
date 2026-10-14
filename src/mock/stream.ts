import type { StreamStatsResponse, InjectBatchResponse } from '@/types/api'

const SOURCES = ['source_a', 'source_b', 'source_c']
const ENTITY_TYPES = ['animal', 'farm', 'milk_production', 'feed_cost']
const DISPOSITIONS = ['passed', 'passed', 'passed', 'passed', 'auto_corrected', 'auto_corrected', 'quarantined']
const REASON_CODES = ['UNIT_CONVERT', 'DATE_PARSE', null, null, null, 'MISSING_ID', 'DUPLICATE']

function makeEvent(index: number) {
  const disposition = DISPOSITIONS[index % DISPOSITIONS.length]
  return {
    event_id: `EVT-${String(index + 1).padStart(4, '0')}`,
    timestamp: new Date(Date.now() - (20 - index) * 15_000).toISOString(),
    source_system: SOURCES[index % SOURCES.length],
    entity_type: ENTITY_TYPES[index % ENTITY_TYPES.length],
    event_type: 'ingest',
    disposition,
    reason_code: REASON_CODES[index % REASON_CODES.length],
    record_id: `REC-${String(1000 + index).padStart(6, '0')}`,
  }
}

const data: StreamStatsResponse = {
  events_per_second: 4.7,
  avg_latency_ms: 142,
  accepted_count: 15,
  auto_corrected_count: 3,
  quarantined_count: 2,
  recent_events: Array.from({ length: 20 }, (_, i) => makeEvent(i)),
  as_of: new Date().toISOString(),
  mode: 'replay',
}

export function mockStreamStats(): Promise<StreamStatsResponse> {
  return Promise.resolve({
    ...data,
    as_of: new Date().toISOString(),
  })
}

export function mockInjectBatch(): Promise<InjectBatchResponse> {
  return Promise.resolve({
    injected: 50,
    accepted: 42,
    auto_corrected: 5,
    quarantined: 3,
    run_id: 'RUN-2024-002',
  })
}
