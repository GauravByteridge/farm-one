/**
 * Mock metric registry — MET-001 through MET-008.
 * Values MUST match metric_registry_seed.py exactly:
 * metric_name, display_name, business_definition, unit, grain, status=certified
 */

import type { MetricsListResponse, MetricImpactResponse } from '@/types/api'

const FARMS = ['FARM-00101', 'FARM-00142', 'FARM-00203', 'FARM-00267', 'FARM-00312']
const FARM_NAMES: Record<string, string> = {
  'FARM-00101': 'Green Valley Dairy',
  'FARM-00142': 'Sunrise Farm',
  'FARM-00203': 'Hillside Ranch',
  'FARM-00267': 'Valley View Farm',
  'FARM-00312': 'Blue Ridge Farm',
}

const data: MetricsListResponse = {
  metrics: [
    {
      metric_id: 'MET-001',
      metric_name: 'active_animal_count',
      display_name: 'Active Animals',
      business_definition:
        "Total count of animals with status = 'active' as of the requested date across all farms in scope. Includes milking cows, dry cows, heifers, bulls, and calves. Does not include culled, sold, dead, or transferred animals.",
      unit: 'count',
      grain: 'daily',
      allowed_dimensions: ['canonical_farm_id', 'region', 'farm_type', 'animal_type'],
      allowed_filters: ['farm_type', 'region', 'herd_size_band', 'status'],
      source_tables: ['gold.farm_metrics_daily', 'gold.dim_animal'],
      calculation_note: 'SUM(active_animal_count) FROM gold.farm_metrics_daily WHERE metric_date = :date',
      owner: 'Data Engineering',
      status: 'certified',
      version: '1.0',
      effective_from: '2024-01-01',
      effective_to: '9999-12-31',
      is_current: true,
      caveats: 'Animals in transit between farms are counted at the source farm.',
      last_updated_by: 'system',
      last_updated_at: null,
    },
    {
      metric_id: 'MET-002',
      metric_name: 'active_milking_cow_count',
      display_name: 'Active Milking Cows',
      business_definition:
        'Count of female animals with is_milking_cow = True as of the requested date. A cow is milking if she has calved and is within her current lactation. Dry cows, heifers, and animals past 305 days in milk are excluded.',
      unit: 'count',
      grain: 'daily',
      allowed_dimensions: ['canonical_farm_id', 'region', 'farm_type', 'breed'],
      allowed_filters: ['farm_type', 'region', 'herd_size_band', 'breed'],
      source_tables: ['gold.farm_metrics_daily', 'gold.dim_animal'],
      calculation_note: 'SUM(active_milking_cow_count) FROM gold.farm_metrics_daily WHERE metric_date = :date',
      owner: 'Data Engineering',
      status: 'certified',
      version: '1.0',
      effective_from: '2024-01-01',
      effective_to: '9999-12-31',
      is_current: true,
      caveats: 'Lactation cutoff at 305 days in milk follows industry standard.',
      last_updated_by: 'system',
      last_updated_at: null,
    },
    {
      metric_id: 'MET-003',
      metric_name: 'avg_daily_milk_per_cow',
      display_name: 'Average Daily Milk per Cow',
      business_definition:
        'Total milk produced on the requested date divided by the number of active milking cows on that date. Expressed in kilograms. Only passed and auto-corrected records contribute; quarantined records are excluded.',
      unit: 'kg/cow/day',
      grain: 'daily',
      allowed_dimensions: ['canonical_farm_id', 'region', 'farm_type', 'breed'],
      allowed_filters: ['farm_type', 'region', 'herd_size_band'],
      source_tables: ['gold.farm_metrics_daily'],
      calculation_note: 'AVG(avg_milk_per_cow_kg) FROM gold.farm_metrics_daily WHERE metric_date = :date',
      owner: 'Data Engineering',
      status: 'certified',
      version: '1.0',
      effective_from: '2024-01-01',
      effective_to: '9999-12-31',
      is_current: true,
      caveats: 'Robotic milking sessions are aggregated to full-day before division.',
      last_updated_by: 'system',
      last_updated_at: null,
    },
    {
      metric_id: 'MET-004',
      metric_name: 'total_milk_production',
      display_name: 'Total Milk Production',
      business_definition:
        'Sum of all milk produced across farms in scope for the requested period. All values standardized to kilograms. Excludes quarantined records.',
      unit: 'kg',
      grain: 'daily',
      allowed_dimensions: ['canonical_farm_id', 'region', 'farm_type'],
      allowed_filters: ['farm_type', 'region', 'herd_size_band', 'period'],
      source_tables: ['gold.farm_metrics_daily', 'gold.fact_milk_production'],
      calculation_note: 'SUM(total_milk_kg) FROM gold.farm_metrics_daily WHERE metric_date BETWEEN :start AND :end',
      owner: 'Data Engineering',
      status: 'certified',
      version: '1.0',
      effective_from: '2024-01-01',
      effective_to: '9999-12-31',
      is_current: true,
      caveats: null,
      last_updated_by: 'system',
      last_updated_at: null,
    },
    {
      metric_id: 'MET-005',
      metric_name: 'feed_cost_per_kg_milk',
      display_name: 'Feed Cost per kg of Milk',
      business_definition:
        'Total feed cost for the period divided by total milk production for the same period and farm. Feed costs are standardized to USD; milk to kilograms. Provides the primary economic efficiency metric for farm comparison.',
      unit: 'USD/kg',
      grain: 'monthly',
      allowed_dimensions: ['canonical_farm_id', 'region', 'farm_type', 'herd_size_band'],
      allowed_filters: ['farm_type', 'region', 'herd_size_band', 'period_year', 'period_month'],
      source_tables: ['gold.feed_cost_analysis'],
      calculation_note: 'SELECT cost_per_kg_milk FROM gold.feed_cost_analysis WHERE canonical_farm_id = :farm AND period_year = :year AND period_month = :month',
      owner: 'Data Engineering',
      status: 'certified',
      version: '1.0',
      effective_from: '2024-01-01',
      effective_to: '9999-12-31',
      is_current: true,
      caveats: 'Exchange rates are fixed at ingestion time. USD conversions use end-of-period rate.',
      last_updated_by: 'system',
      last_updated_at: null,
    },
    {
      metric_id: 'MET-006',
      metric_name: 'duplicate_entity_rate',
      display_name: 'Duplicate Entity Rate',
      business_definition:
        'Percentage of source animal or farm records that were identified as duplicates of an existing canonical entity during entity resolution. Calculated per source system and entity type.',
      unit: '%',
      grain: 'point_in_time',
      allowed_dimensions: ['source_system', 'entity_type'],
      allowed_filters: ['source_system', 'entity_type', 'run_id'],
      source_tables: ['gold.dq_summary'],
      calculation_note: 'duplicate_count / total_records * 100 FROM gold.dq_summary',
      owner: 'Data Engineering',
      status: 'certified',
      version: '1.0',
      effective_from: '2024-01-01',
      effective_to: '9999-12-31',
      is_current: true,
      caveats: 'Rate is per pipeline run. Compare across runs to track improvement.',
      last_updated_by: 'system',
      last_updated_at: null,
    },
    {
      metric_id: 'MET-007',
      metric_name: 'data_quality_pass_rate',
      display_name: 'Data Quality Pass Rate',
      business_definition:
        'Percentage of source records that passed all quality rules without correction or quarantine. Auto-corrected records are counted separately and not included in the pass rate.',
      unit: '%',
      grain: 'point_in_time',
      allowed_dimensions: ['source_system', 'entity_type'],
      allowed_filters: ['source_system', 'entity_type', 'run_id'],
      source_tables: ['gold.dq_summary'],
      calculation_note: 'pass_rate FROM gold.dq_summary (pre-calculated as passed_records / total_records * 100)',
      owner: 'Data Engineering',
      status: 'certified',
      version: '1.0',
      effective_from: '2024-01-01',
      effective_to: '9999-12-31',
      is_current: true,
      caveats: null,
      last_updated_by: 'system',
      last_updated_at: null,
    },
    {
      metric_id: 'MET-008',
      metric_name: 'quarantined_record_count',
      display_name: 'Quarantined Record Count',
      business_definition:
        'Number of source records that failed quality rules and could not be automatically corrected. These records are held in quarantine and excluded from all Silver and Gold calculations until reviewed.',
      unit: 'count',
      grain: 'point_in_time',
      allowed_dimensions: ['source_system', 'entity_type'],
      allowed_filters: ['source_system', 'entity_type', 'run_id'],
      source_tables: ['gold.dq_summary'],
      calculation_note: 'SUM(quarantined_records) FROM gold.dq_summary',
      owner: 'Data Engineering',
      status: 'certified',
      version: '1.0',
      effective_from: '2024-01-01',
      effective_to: '9999-12-31',
      is_current: true,
      caveats: 'Quarantined records are preserved in Bronze. Original values are never deleted.',
      last_updated_by: 'system',
      last_updated_at: null,
    },
  ],
}

export function mockMetricsList(): Promise<MetricsListResponse> {
  return Promise.resolve(data)
}

export function mockMetricImpact(metricId: string): Promise<MetricImpactResponse> {
  const metric = data.metrics.find((m) => m.metric_id === metricId)
  return Promise.resolve({
    metric_id: metricId,
    metric_name: metric?.metric_name ?? 'unknown',
    display_name: metric?.display_name ?? 'Unknown',
    unit: metric?.unit ?? 'count',
    samples: FARMS.map((farmId) => ({
      canonical_farm_id: farmId,
      farm_name: FARM_NAMES[farmId] ?? farmId,
      value: metricId === 'MET-001' ? Math.floor(200 + Math.random() * 400) :
             metricId === 'MET-005' ? 0.28 + Math.random() * 0.15 :
             Math.floor(50 + Math.random() * 100),
      unit: metric?.unit ?? 'count',
      date: '2024-06-15',
    })),
  })
}
