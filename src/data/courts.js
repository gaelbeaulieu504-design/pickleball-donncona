export const COURTS = [
  { id: 1, name: 'Terrain 1', color: '#166534' },
  { id: 2, name: 'Terrain 2', color: '#1d4ed8' },
  { id: 3, name: 'Terrain 3', color: '#7c3aed' },
  { id: 4, name: 'Terrain 4', color: '#b45309' },
]

// Each slot is a 2-hour block. Courts open 6h00, close 22h00.
export const TIME_SLOTS = [
  '6h00 – 8h00',
  '8h00 – 10h00',
  '10h00 – 12h00',
  '12h00 – 14h00',
  '14h00 – 16h00',
  '16h00 – 18h00',
  '18h00 – 20h00',
  '20h00 – 22h00',
]

export const PRICING = {
  resident: 30,       // one-time seasonal pass
  nonResident: 50,    // one-time seasonal pass
}

export const WEEKLY_HOUR_LIMIT = 6    // hours per week
export const SESSION_DURATION = 2     // hours per booking

// Current season boundaries
export const SEASON_START = new Date(2026, 5, 1)  // June 1
export const SEASON_END   = new Date(2026, 8, 1)  // September 1 (exclusive)

// Simulate some pre-booked slots
export function buildBookedSet() {
  return new Set([
    '1|2026-03-16|9h00 – 11h00',
    '1|2026-03-16|10h00 – 12h00',
    '2|2026-03-16|6h00 – 8h00',
    '3|2026-03-17|14h00 – 16h00',
    '4|2026-03-17|16h00 – 18h00',
    '2|2026-03-18|10h00 – 12h00',
  ])
}
