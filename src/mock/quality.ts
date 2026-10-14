import type { DqScorecardResponse, DqIssuesResponse } from '@/types/api'

const FARMS = ['FARM-00101', 'FARM-00142', 'FARM-00203', 'FARM-00267', 'FARM-00312']

const summaries: DqScorecardResponse = {
  run_id: 'RUN-2024-002',
  summaries: [
    // source_a
    { summary_id: 'SUM-001', run_id: 'RUN-2024-002', run_date: '2024-06-15', source_system: 'source_a', entity_type: 'animal', total_records: 1280, passed_records: 1205, auto_corrected_records: 48, quarantined_records: 27, pass_rate: 94.1, quarantine_rate: 2.1, duplicate_count: 5, missing_id_count: 12, unit_inconsistency_count: 22, invalid_date_count: 8, implausible_value_count: 3, schema_drift_count: 0, top_issue_codes: ['QR-UNIT-001', 'QR-ID-002', 'QR-DATE-003'], created_at: '2024-06-15T10:00:00Z' },
    { summary_id: 'SUM-002', run_id: 'RUN-2024-002', run_date: '2024-06-15', source_system: 'source_a', entity_type: 'farm', total_records: 5, passed_records: 5, auto_corrected_records: 0, quarantined_records: 0, pass_rate: 100.0, quarantine_rate: 0.0, duplicate_count: 0, missing_id_count: 0, unit_inconsistency_count: 0, invalid_date_count: 0, implausible_value_count: 0, schema_drift_count: 0, top_issue_codes: null, created_at: '2024-06-15T10:00:00Z' },
    // source_b
    { summary_id: 'SUM-003', run_id: 'RUN-2024-002', run_date: '2024-06-15', source_system: 'source_b', entity_type: 'animal', total_records: 1215, passed_records: 1111, auto_corrected_records: 62, quarantined_records: 42, pass_rate: 91.4, quarantine_rate: 3.5, duplicate_count: 18, missing_id_count: 24, unit_inconsistency_count: 31, invalid_date_count: 11, implausible_value_count: 7, schema_drift_count: 2, top_issue_codes: ['QR-UNIT-001', 'QR-DUP-004', 'QR-ID-002'], created_at: '2024-06-15T10:00:00Z' },
    { summary_id: 'SUM-004', run_id: 'RUN-2024-002', run_date: '2024-06-15', source_system: 'source_b', entity_type: 'farm', total_records: 5, passed_records: 4, auto_corrected_records: 1, quarantined_records: 0, pass_rate: 80.0, quarantine_rate: 0.0, duplicate_count: 1, missing_id_count: 0, unit_inconsistency_count: 0, invalid_date_count: 0, implausible_value_count: 0, schema_drift_count: 0, top_issue_codes: ['QR-DUP-004'], created_at: '2024-06-15T10:00:00Z' },
    // source_c
    { summary_id: 'SUM-005', run_id: 'RUN-2024-002', run_date: '2024-06-15', source_system: 'source_c', entity_type: 'animal', total_records: 1340, passed_records: 1296, auto_corrected_records: 28, quarantined_records: 16, pass_rate: 96.7, quarantine_rate: 1.2, duplicate_count: 2, missing_id_count: 6, unit_inconsistency_count: 8, invalid_date_count: 4, implausible_value_count: 1, schema_drift_count: 0, top_issue_codes: ['QR-UNIT-001', 'QR-ID-002'], created_at: '2024-06-15T10:00:00Z' },
  ],
}

const FARM_REF = FARMS  // use all 5 farm IDs
void FARM_REF  // reference so linter doesn't complain

const issues: DqIssuesResponse = {
  run_id: 'RUN-2024-002',
  total_count: 85,
  issues: [
    {
      issue_id: 'ISS-0001', run_id: 'RUN-2024-002', source_system: 'source_a', entity_type: 'animal',
      source_record_id: `SRC-A-ANML-${FARMS[0]}-00042`, rule_id: 'QR-UNIT-001', rule_description: 'Milk volume unit inconsistency: lb instead of kg',
      severity: 'warning', disposition: 'auto_corrected', field_name: 'milk_volume', original_value: '62.5 lb',
      corrected_value: '28.35 kg', reason_code: 'UNIT_CONVERT', reason_description: 'Converted lb to kg using factor 0.453592',
      sample_record: JSON.stringify({ animal_id: 'ANML-042', farm_id: FARMS[0], milk_volume: '62.5 lb', date: '2024-06-14' }), created_at: '2024-06-15T10:05:00Z',
    },
    {
      issue_id: 'ISS-0002', run_id: 'RUN-2024-002', source_system: 'source_b', entity_type: 'animal',
      source_record_id: `SRC-B-ANML-${FARMS[1]}-00107`, rule_id: 'QR-DUP-004', rule_description: 'Duplicate animal record detected across ingestion batches',
      severity: 'error', disposition: 'quarantined', field_name: 'ear_tag', original_value: 'TAG-107',
      corrected_value: null, reason_code: 'DUPLICATE', reason_description: 'Exact duplicate of record SRC-B-ANML-FARM-00142-00107 from prior run',
      sample_record: JSON.stringify({ animal_id: 'ANML-107', farm_id: FARMS[1], ear_tag: 'TAG-107', run_id: 'RUN-2024-001' }), created_at: '2024-06-15T10:06:00Z',
    },
    {
      issue_id: 'ISS-0003', run_id: 'RUN-2024-002', source_system: 'source_a', entity_type: 'animal',
      source_record_id: `SRC-A-ANML-${FARMS[2]}-00215`, rule_id: 'QR-DATE-003', rule_description: 'Birth date in future',
      severity: 'error', disposition: 'quarantined', field_name: 'birth_date', original_value: '2025-03-15',
      corrected_value: null, reason_code: 'FUTURE_DATE', reason_description: 'Birth date 2025-03-15 is in the future',
      sample_record: JSON.stringify({ animal_id: 'ANML-215', farm_id: FARMS[2], birth_date: '2025-03-15' }), created_at: '2024-06-15T10:07:00Z',
    },
    {
      issue_id: 'ISS-0004', run_id: 'RUN-2024-002', source_system: 'source_b', entity_type: 'animal',
      source_record_id: `SRC-B-ANML-${FARMS[3]}-00318`, rule_id: 'QR-ID-002', rule_description: 'Missing required identifier field',
      severity: 'error', disposition: 'quarantined', field_name: 'ear_tag', original_value: null,
      corrected_value: null, reason_code: 'MISSING_ID', reason_description: 'No ear_tag, eid, or registration_number provided',
      sample_record: JSON.stringify({ animal_id: 'ANML-318', farm_id: FARMS[3], breed: 'Holstein' }), created_at: '2024-06-15T10:08:00Z',
    },
    {
      issue_id: 'ISS-0005', run_id: 'RUN-2024-002', source_system: 'source_c', entity_type: 'animal',
      source_record_id: `SRC-C-ANML-${FARMS[4]}-00421`, rule_id: 'QR-UNIT-001', rule_description: 'Milk volume unit inconsistency: litre instead of kg',
      severity: 'warning', disposition: 'auto_corrected', field_name: 'milk_volume', original_value: '30.5 L',
      corrected_value: '31.42 kg', reason_code: 'UNIT_CONVERT', reason_description: 'Converted litres to kg using density factor 1.03',
      sample_record: JSON.stringify({ animal_id: 'ANML-421', farm_id: FARMS[4], milk_volume: '30.5 L', date: '2024-06-14' }), created_at: '2024-06-15T10:09:00Z',
    },
    {
      issue_id: 'ISS-0006', run_id: 'RUN-2024-002', source_system: 'source_b', entity_type: 'animal',
      source_record_id: `SRC-B-ANML-${FARMS[0]}-00509`, rule_id: 'QR-VAL-005', rule_description: 'Implausible milk value: exceeds physiological maximum',
      severity: 'warning', disposition: 'flagged_for_review', field_name: 'milk_quantity_kg', original_value: '155.2',
      corrected_value: null, reason_code: 'IMPLAUSIBLE_VALUE', reason_description: 'Daily milk of 155.2 kg exceeds maximum of 80 kg per day',
      sample_record: JSON.stringify({ animal_id: 'ANML-509', farm_id: FARMS[0], milk_quantity_kg: 155.2, date: '2024-06-13' }), created_at: '2024-06-15T10:10:00Z',
    },
  ],
}

export function mockDqScorecard(): Promise<DqScorecardResponse> {
  return Promise.resolve(summaries)
}

export function mockDqIssues(): Promise<DqIssuesResponse> {
  return Promise.resolve(issues)
}
