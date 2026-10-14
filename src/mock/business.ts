import type { FeedCostResponse } from '@/types/api'

const FARMS = [
  { id: 'FARM-00101', name: 'Green Valley Dairy', region: 'North', farm_type: 'dairy', herd_size_band: 'large' },
  { id: 'FARM-00142', name: 'Sunrise Farm', region: 'North', farm_type: 'dairy', herd_size_band: 'medium' },
  { id: 'FARM-00203', name: 'Hillside Ranch', region: 'South', farm_type: 'beef', herd_size_band: 'small' },
  { id: 'FARM-00267', name: 'Valley View Farm', region: 'East', farm_type: 'dairy', herd_size_band: 'large' },
  { id: 'FARM-00312', name: 'Blue Ridge Farm', region: 'West', farm_type: 'dairy', herd_size_band: 'medium' },
]

// Farm costs per kg milk — some above cohort, some below; two with ranking change after resolution
const FARM_COSTS = [0.274, 0.318, 0.392, 0.251, 0.301]
const PRE_RESOLUTION_COSTS = [0.312, 0.318, 0.392, 0.291, 0.289]
const RANKS = [2, 4, 5, 1, 3]
const COHORT_AVG = 0.3072
const COHORT_P25 = 0.2620
const COHORT_MEDIAN = 0.3010
const COHORT_P75 = 0.3380

const data: FeedCostResponse = {
  period_year: 2024,
  period_month: 5,
  analyses: FARMS.map((farm, i) => {
    const cost = FARM_COSTS[i]
    const preCost = PRE_RESOLUTION_COSTS[i]
    const rank = RANKS[i]
    const preRank = [4, 4, 5, 3, 2][i]
    return {
      analysis_id: `ANA-${farm.id}-2024-05`,
      canonical_farm_id: farm.id,
      farm_name: farm.name,
      region: farm.region,
      farm_type: farm.farm_type,
      herd_size_band: farm.herd_size_band,
      period_year: 2024,
      period_month: 5,
      total_feed_cost_usd: cost * 18500,
      total_milk_kg: 18500,
      cost_per_kg_milk: cost,
      farm_cohort: `${farm.region}-${farm.herd_size_band}`,
      cohort_farm_count: 3,
      cohort_avg_cost_per_kg: COHORT_AVG,
      cohort_p25_cost_per_kg: COHORT_P25,
      cohort_median_cost_per_kg: COHORT_MEDIAN,
      cohort_p75_cost_per_kg: COHORT_P75,
      cost_rank_in_cohort: rank,
      cost_percentile: rank <= 1 ? 10 : rank <= 2 ? 30 : rank <= 3 ? 50 : rank <= 4 ? 75 : 90,
      vs_cohort_avg_pct: ((cost - COHORT_AVG) / COHORT_AVG) * 100,
      is_above_cohort: cost > COHORT_AVG,
      pre_resolution_cost_per_kg: preCost,
      ranking_changed_after_resolution: rank !== preRank,
      run_id: 'RUN-2024-002',
      lineage_id: `LIN-BUS-${farm.id}`,
      created_at: '2024-06-15T10:00:00Z',
    }
  }),
}

export function mockFeedCost(): Promise<FeedCostResponse> {
  return Promise.resolve(data)
}
