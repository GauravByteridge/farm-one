/**
 * MOCK MODE — no backend required.
 * Returns static data matching DataTrustResponse shape.
 */
import type { DataTrustResponse } from '@/types/api'

const MOCK_TRUST: DataTrustResponse = {
  run_id: 'RUN-2024-002',
  run_date: '2024-06-15',
  coverage_matrix: [
    { farm: 'Green Valley Farm',     farm_id: 'FARM-00101', source_a: 98.2, source_b: 94.1, source_c: 96.8, overall: 95.5 },
    { farm: 'Sunrise Farm',          farm_id: 'FARM-00142', source_a: 92.4, source_b: 89.8, source_c: null,  overall: 91.0 },
    { farm: 'Hillside Ranch',        farm_id: 'FARM-00203', source_a: 84.1, source_b: 80.6, source_c: null,  overall: 82.3 },
    { farm: 'Valley View Estate',    farm_id: 'FARM-00267', source_a: 99.1, source_b: 97.8, source_c: 98.5, overall: 98.5 },
    { farm: 'Blue Ridge Dairy',      farm_id: 'FARM-00312', source_a: 95.2, source_b: 93.1, source_c: 94.4, overall: 94.2 },
    { farm: 'Shannon Valley',        farm_id: 'FARM-00348', source_a: 90.8, source_b: 88.1, source_c: null,  overall: 89.4 },
    { farm: 'Kilkenny Pastures',     farm_id: 'FARM-00389', source_a: 94.2, source_b: 91.8, source_c: 93.3, overall: 93.1 },
    { farm: 'Cork Grasslands',       farm_id: 'FARM-00421', source_a: 93.0, source_b: 90.5, source_c: null,  overall: 91.8 },
    { farm: 'De Waard Hoeve',        farm_id: 'FARM-00452', source_a: 99.3, source_b: 97.4, source_c: 97.8, overall: 98.2 },
    { farm: 'Noord-Holland Dairy',   farm_id: 'FARM-00487', source_a: 98.1, source_b: 97.0, source_c: 97.6, overall: 97.6 },
    { farm: 'Canterbury Plains',     farm_id: 'FARM-00512', source_a: 94.2, source_b: 92.6, source_c: 93.4, overall: 93.4 },
    { farm: 'Waikato Grasslands',    farm_id: 'FARM-00534', source_a: 91.4, source_b: 88.7, source_c: null,  overall: 90.1 },
    { farm: 'Perthshire Cattle Co.', farm_id: 'FARM-00567', source_a: 87.2, source_b: 85.4, source_c: null,  overall: 86.3 },
  ],
  reconciliation: {
    total_entities: 14820,
    matched: 14643,
    pending_review: 42,
    unmatched: 135,
    match_rate: 94.1,
    precision_eval: 96.2,
    recall_eval: 93.8,
    note: 'Evaluated on 500-record held-out test set. Source B has highest false-duplicate rate.',
  },
  quality_issues: [
    { category: 'Unit Inconsistency (lb→kg)',   count: 61,  pct: 7.8,  severity: 'HIGH',   sources: ['source_b'],             disposition: 'auto-corrected', rule: 'QR-UNIT-001' },
    { category: 'Implausible Milk Value',        count: 11,  pct: 1.4,  severity: 'MEDIUM', sources: ['source_a','source_b'],  disposition: 'quarantined',    rule: 'QR-PLAUS-002' },
    { category: 'Future Date',                   count: 3,   pct: 0.4,  severity: 'HIGH',   sources: ['source_b'],             disposition: 'quarantined',    rule: 'QR-DATE-003' },
    { category: 'Missing Identifier',            count: 42,  pct: 5.4,  severity: 'MEDIUM', sources: ['source_b'],             disposition: 'flagged',        rule: 'QR-ID-002' },
    { category: 'Schema Drift',                  count: 2,   pct: 0.3,  severity: 'LOW',    sources: ['source_b'],             disposition: 'logged',         rule: 'QR-SCHEMA-004' },
    { category: 'Duplicate Record',              count: 97,  pct: 12.4, severity: 'HIGH',   sources: ['source_b','source_a'],  disposition: 'merged',         rule: 'QR-DUP-001' },
  ],
  completeness_trend: Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i] + ' 2024',
    completeness: parseFloat((91 + i * 0.25 + Math.sin(i * 0.5) * 0.8).toFixed(1)),
    records: Math.round(98000 + i * 1200 + Math.random() * 2000),
  })),
  coverage_warnings: [
    { farm: 'Hillside Ranch',        farm_id: 'FARM-00203', issue: 'Source C not reporting — beef farm exclusion',  severity: 'warning' },
    { farm: 'Perthshire Cattle Co.', farm_id: 'FARM-00567', issue: 'Source C not reporting — beef farm exclusion',  severity: 'warning' },
    { farm: 'Shannon Valley',        farm_id: 'FARM-00348', issue: 'Source B batch delayed 48h — check FarmCore ERP', severity: 'info' },
  ],
}

export async function fetchDataTrust(): Promise<DataTrustResponse> {
  await new Promise(r => setTimeout(r, 300))
  return MOCK_TRUST
}
