/**
 * MOCK MODE — no backend required.
 * Returns static data matching OverviewResponse shape.
 */
import type { OverviewResponse } from '@/types/api'

// 5-year monthly production trend (Jan 2020 – Dec 2024)
const MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
]
const PRODUCTION_TREND = Array.from({ length: 60 }, (_, i) => {
  const year = 2020 + Math.floor(i / 12)
  const mon  = MONTHS[i % 12]
  const base = 28_000_000 + Math.sin(i * 0.4) * 1_500_000
  const milk = Math.round(base + i * 18_000 + (Math.random() - 0.5) * 400_000)
  return {
    month: `${mon} '${String(year).slice(2)}`,
    date:  `${year}-${String((i % 12) + 1).padStart(2, '0')}-01`,
    total_milk_kg:       milk,
    avg_milk_per_cow_kg: parseFloat((milk / 11_480).toFixed(1)),
    total_revenue_eur:   Math.round(milk * 0.38),
    feed_cost_eur:       Math.round(milk * 0.12),
    gross_margin_eur:    Math.round(milk * 0.26),
    net_margin_eur:      Math.round(milk * 0.20),
  }
})

const FARM_COMPARISON = [
  { farm_name: 'Green Valley Farm',     canonical_farm_id: 'FARM-00101', avg_milk_per_cow_kg: 29.8, active_animals: 1240 },
  { farm_name: 'Sunrise Farm',          canonical_farm_id: 'FARM-00142', avg_milk_per_cow_kg: 27.4, active_animals: 980  },
  { farm_name: 'Hillside Ranch',        canonical_farm_id: 'FARM-00203', avg_milk_per_cow_kg: 22.1, active_animals: 860  },
  { farm_name: 'Valley View Estate',    canonical_farm_id: 'FARM-00267', avg_milk_per_cow_kg: 31.2, active_animals: 1150 },
  { farm_name: 'Blue Ridge Dairy',      canonical_farm_id: 'FARM-00312', avg_milk_per_cow_kg: 28.6, active_animals: 920  },
  { farm_name: 'Shannon Valley',        canonical_farm_id: 'FARM-00348', avg_milk_per_cow_kg: 26.9, active_animals: 1100 },
  { farm_name: 'Kilkenny Pastures',     canonical_farm_id: 'FARM-00389', avg_milk_per_cow_kg: 28.1, active_animals: 870  },
  { farm_name: 'Cork Grasslands',       canonical_farm_id: 'FARM-00421', avg_milk_per_cow_kg: 27.5, active_animals: 950  },
  { farm_name: 'De Waard Hoeve',        canonical_farm_id: 'FARM-00452', avg_milk_per_cow_kg: 32.4, active_animals: 1320 },
  { farm_name: 'Noord-Holland Dairy',   canonical_farm_id: 'FARM-00487', avg_milk_per_cow_kg: 33.1, active_animals: 1410 },
  { farm_name: 'Canterbury Plains',     canonical_farm_id: 'FARM-00512', avg_milk_per_cow_kg: 25.8, active_animals: 2200 },
  { farm_name: 'Waikato Grasslands',    canonical_farm_id: 'FARM-00534', avg_milk_per_cow_kg: 24.6, active_animals: 2650 },
  { farm_name: 'Perthshire Cattle Co.', canonical_farm_id: 'FARM-00567', avg_milk_per_cow_kg: 18.2, active_animals: 780  },
]

const MOCK_OVERVIEW: OverviewResponse = {
  run_id: 'RUN-2024-002',
  run_date: '2024-06-15',
  total_farms: 13,
  total_animals: 14820,
  total_milking_cows: 11480,
  data_match_rate: 94.1,
  data_quality_score: 94.1,
  production_trend: PRODUCTION_TREND,
  farm_comparison: FARM_COMPARISON,
  data_trust: {
    matched_entities: 14643,
    unmatched_entities: 177,
    quarantined_records: 782,
    pass_rate: 94.1,
  },
  pipeline_last_run: {
    run_id: 'RUN-2024-002',
    status: 'completed',
    total_input_rows: 1_247_832,
    total_output_rows: 1_236_721,
    total_duration_s: 142,
    completed_at: '2024-06-15T06:32:17Z',
  },
  ai_insights: [
    'Milk yield declined 12.4% on Hillside Ranch — SCC elevation and feed delivery issues detected.',
    'Valley View leads group at 31.2 kg/cow/day for 4th consecutive week.',
    'Source B quarantine rate (3.5%) is 3× Source C — duplicate batch ingestion root cause identified.',
    'Heat stress risk elevated; THI above 68 on 12 of last 14 days.',
    'Entity resolution removed 97 duplicate animal records across Source A and Source B.',
  ],
}

export async function fetchOverview(): Promise<OverviewResponse> {
  // Simulate a brief network delay for realistic UX
  await new Promise(r => setTimeout(r, 300))
  return MOCK_OVERVIEW
}
