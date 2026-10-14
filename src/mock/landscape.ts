import type { LandscapeResponse } from '@/types/api'

const data: LandscapeResponse = {
  run_id: 'RUN-2024-002',
  source_cards: [
    {
      source_system: 'source_a',
      total_farms: 5,
      total_animals: 1280,
      total_customers: 18,
      entity_types: ['farm', 'animal', 'customer', 'milk_production'],
      identifier_types: ['ear_tag', 'eid', 'registration_number'],
      schema_fields: 42,
      time_range_start: '2023-01-01',
      time_range_end: '2024-06-15',
      last_ingested_at: '2024-06-15T08:00:00Z',
      format: 'CSV',
    },
    {
      source_system: 'source_b',
      total_farms: 5,
      total_animals: 1215,
      total_customers: 14,
      entity_types: ['farm', 'animal', 'milk_production', 'feed_cost'],
      identifier_types: ['ear_tag', 'farm_code'],
      schema_fields: 38,
      time_range_start: '2023-03-01',
      time_range_end: '2024-06-14',
      last_ingested_at: '2024-06-15T09:15:00Z',
      format: 'JSON',
    },
    {
      source_system: 'source_c',
      total_farms: 5,
      total_animals: 1340,
      total_customers: 22,
      entity_types: ['farm', 'animal', 'customer', 'milk_production', 'feed_cost'],
      identifier_types: ['eid', 'microchip', 'registration_number'],
      schema_fields: 51,
      time_range_start: '2023-01-15',
      time_range_end: '2024-06-15',
      last_ingested_at: '2024-06-15T07:30:00Z',
      format: 'Parquet',
    },
  ],
  schema_diffs: [
    { field_name: 'animal_id', source_a_type: 'string', source_b_type: 'string', source_c_type: 'string', agreement: 'match' },
    { field_name: 'birth_date', source_a_type: 'date', source_b_type: 'string', source_c_type: 'date', agreement: 'mismatch' },
    { field_name: 'milk_volume', source_a_type: 'float', source_b_type: 'float', source_c_type: 'decimal', agreement: 'mismatch' },
    { field_name: 'unit', source_a_type: 'string', source_b_type: null, source_c_type: 'string', agreement: 'missing' },
    { field_name: 'farm_code', source_a_type: 'string', source_b_type: 'string', source_c_type: null, agreement: 'missing' },
    { field_name: 'breed', source_a_type: 'string', source_b_type: 'string', source_c_type: 'string', agreement: 'match' },
    { field_name: 'eid', source_a_type: 'string', source_b_type: null, source_c_type: 'string', agreement: 'missing' },
    { field_name: 'sex', source_a_type: 'string', source_b_type: 'string', source_c_type: 'string', agreement: 'match' },
  ],
}

export function mockLandscape(): Promise<LandscapeResponse> {
  return Promise.resolve(data)
}
