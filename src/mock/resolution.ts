import type { ReviewQueueResponse, MatchDecisionResponse } from '@/types/api'

const FARMS = ['FARM-00101', 'FARM-00142', 'FARM-00203', 'FARM-00267', 'FARM-00312']

const data: ReviewQueueResponse = {
  run_id: 'RUN-2024-002',
  total_count: 12,
  pending_count: 4,
  auto_merged_count: 8,
  resolutions: [
    {
      resolution_id: 'RES-001', entity_type: 'animal', canonical_id: 'ANML-000842',
      source_record_count: 3, source_systems: ['source_a', 'source_b', 'source_c'],
      source_ids: ['SRC-A-ANML-001', 'SRC-B-ANML-001', 'SRC-C-ANML-001'],
      match_method: 'ear_tag', confidence_score: 0.98, match_evidence: JSON.stringify({ ear_tag: { values: ['TAG-842', 'TAG-842', 'TAG-842'], match_type: 'exact', score: 1.0 } }),
      review_status: 'auto_merged', review_decision: 'merged', reviewed_by: 'system', reviewed_at: '2024-06-15T09:00:00Z',
      golden_record: JSON.stringify({ canonical_animal_id: 'ANML-000842', ear_tag: 'TAG-842', farm_id: FARMS[0] }),
      precision_eval: 0.97, recall_eval: 0.95, run_id: 'RUN-2024-002', lineage_id: 'LIN-RES-001', created_at: '2024-06-15T09:00:00Z',
    },
    {
      resolution_id: 'RES-002', entity_type: 'animal', canonical_id: 'ANML-001107',
      source_record_count: 2, source_systems: ['source_a', 'source_c'],
      source_ids: ['SRC-A-ANML-107', 'SRC-C-ANML-107'],
      match_method: 'fuzzy_name', confidence_score: 0.65,
      match_evidence: JSON.stringify({ ear_tag: { values: ['TAG-107A', 'TAG-107'], match_type: 'fuzzy', score: 0.65 } }),
      review_status: 'pending_review', review_decision: null, reviewed_by: null, reviewed_at: null,
      golden_record: null, precision_eval: null, recall_eval: null,
      run_id: 'RUN-2024-002', lineage_id: 'LIN-RES-002', created_at: '2024-06-15T09:01:00Z',
    },
    {
      resolution_id: 'RES-003', entity_type: 'farm', canonical_id: FARMS[1],
      source_record_count: 3, source_systems: ['source_a', 'source_b', 'source_c'],
      source_ids: ['SRC-A-FARM-142', 'SRC-B-FARM-142', 'SRC-C-FARM-142'],
      match_method: 'exact_id', confidence_score: 1.0,
      match_evidence: JSON.stringify({ farm_id: { values: [FARMS[1], FARMS[1], FARMS[1]], match_type: 'exact', score: 1.0 } }),
      review_status: 'auto_merged', review_decision: 'merged', reviewed_by: 'system', reviewed_at: '2024-06-15T09:02:00Z',
      golden_record: JSON.stringify({ canonical_farm_id: FARMS[1], farm_name: 'Sunrise Farm', region: 'North' }),
      precision_eval: 1.0, recall_eval: 1.0, run_id: 'RUN-2024-002', lineage_id: 'LIN-RES-003', created_at: '2024-06-15T09:02:00Z',
    },
    {
      resolution_id: 'RES-004', entity_type: 'animal', canonical_id: 'ANML-002398',
      source_record_count: 2, source_systems: ['source_b', 'source_c'],
      source_ids: ['SRC-B-ANML-398', 'SRC-C-ANML-399'],
      match_method: 'eid', confidence_score: 0.58,
      match_evidence: JSON.stringify({ eid: { values: ['EID-398', 'EID-398X'], match_type: 'fuzzy', score: 0.58 } }),
      review_status: 'pending_review', review_decision: null, reviewed_by: null, reviewed_at: null,
      golden_record: null, precision_eval: null, recall_eval: null,
      run_id: 'RUN-2024-002', lineage_id: 'LIN-RES-004', created_at: '2024-06-15T09:03:00Z',
    },
    {
      resolution_id: 'RES-005', entity_type: 'animal', canonical_id: 'ANML-003071',
      source_record_count: 3, source_systems: ['source_a', 'source_b', 'source_c'],
      source_ids: ['SRC-A-ANML-307', 'SRC-B-ANML-307', 'SRC-C-ANML-307'],
      match_method: 'ear_tag', confidence_score: 0.95,
      match_evidence: JSON.stringify({ ear_tag: { values: ['TAG-307', 'TAG-307', 'TAG-307'], match_type: 'exact', score: 1.0 } }),
      review_status: 'auto_merged', review_decision: 'merged', reviewed_by: 'system', reviewed_at: '2024-06-15T09:04:00Z',
      golden_record: JSON.stringify({ canonical_animal_id: 'ANML-003071', ear_tag: 'TAG-307', farm_id: FARMS[2] }),
      precision_eval: 0.94, recall_eval: 0.93, run_id: 'RUN-2024-002', lineage_id: 'LIN-RES-005', created_at: '2024-06-15T09:04:00Z',
    },
    {
      resolution_id: 'RES-006', entity_type: 'animal', canonical_id: 'ANML-004512',
      source_record_count: 2, source_systems: ['source_a', 'source_b'],
      source_ids: ['SRC-A-ANML-451', 'SRC-B-ANML-452'],
      match_method: 'fuzzy_name', confidence_score: 0.62,
      match_evidence: JSON.stringify({ name: { values: ['Holstein heifer DOB 2022-03-01', 'Holstein female 01/03/2022'], match_type: 'fuzzy', score: 0.62 } }),
      review_status: 'pending_review', review_decision: null, reviewed_by: null, reviewed_at: null,
      golden_record: null, precision_eval: null, recall_eval: null,
      run_id: 'RUN-2024-002', lineage_id: 'LIN-RES-006', created_at: '2024-06-15T09:05:00Z',
    },
  ],
}

export function mockReviewQueue(): Promise<ReviewQueueResponse> {
  return Promise.resolve(data)
}

export function mockMatchDecision(resolutionId: string): Promise<MatchDecisionResponse> {
  return Promise.resolve({
    resolution_id: resolutionId,
    review_status: 'reviewed',
    review_decision: 'merged',
    reviewed_at: new Date().toISOString(),
    reviewed_by: 'demo_user',
  })
}
