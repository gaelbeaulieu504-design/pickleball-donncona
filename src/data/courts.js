export const COURTS = [
  { id: 1, name: 'Terrain 1', color: '#166534' },
  { id: 2, name: 'Terrain 2', color: '#1d4ed8' },
  { id: 3, name: 'Terrain 3', color: '#7c3aed' },
  { id: 4, name: 'Terrain 4', color: '#b45309' },
]

// Individual 1-hour start times. Courts open 6h00, close 22h00.
// For 1h session: valid starts 6h00 – 21h00 (ends at 22h00 max)
// For 2h session: valid starts 6h00 – 20h00 (ends at 22h00 max)
export const START_TIMES = [
  '6h00', '7h00', '8h00', '9h00', '10h00', '11h00',
  '12h00', '13h00', '14h00', '15h00', '16h00', '17h00',
  '18h00', '19h00', '20h00', '21h00',
]

export const DURATIONS = [1, 2] // hours

export const PRICING = {
  resident: 30,       // one-time seasonal pass
  nonResident: 50,    // one-time seasonal pass
}

export const WEEKLY_HOUR_LIMIT = 6    // hours per week

// Returns the display label for a booking
export function slotLabel(start, duration) {
  const idx = START_TIMES.indexOf(start)
  if (idx === -1) return start
  const endIdx = idx + duration
  return `${start} – ${START_TIMES[endIdx] ?? '22h00'}`
}

// Returns all 1h slot indices covered by a booking
export function coveredIndices(startSlot, duration) {
  const idx = START_TIMES.indexOf(startSlot)
  if (idx === -1) return []
  return Array.from({ length: duration }, (_, i) => idx + i)
}

// Simulate some pre-booked slots (stored as { courtId, date, startSlot, duration })
export function buildInitialBookings() {
  return [
    { id: 'seed1', userId: '__seed__', courtId: 1, date: '2026-03-16', startSlot: '9h00',  duration: 2 },
    { id: 'seed2', userId: '__seed__', courtId: 2, date: '2026-03-16', startSlot: '6h00',  duration: 1 },
    { id: 'seed3', userId: '__seed__', courtId: 3, date: '2026-03-17', startSlot: '14h00', duration: 2 },
    { id: 'seed4', userId: '__seed__', courtId: 4, date: '2026-03-17', startSlot: '16h00', duration: 1 },
  ]
}
