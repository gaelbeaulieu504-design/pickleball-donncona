export const COURTS = [
  { id: 1, name: 'Court 1', color: '#166534' },
  { id: 2, name: 'Court 2', color: '#1d4ed8' },
  { id: 3, name: 'Court 3', color: '#7c3aed' },
  { id: 4, name: 'Court 4', color: '#b45309' },
  { id: 5, name: 'Court 5', color: '#0e7490' },
  { id: 6, name: 'Court 6', color: '#be185d' },
]

export const TIME_SLOTS = [
  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM',
]

export const PRICING = {
  resident: 30,
  nonResident: 50,
}

// Simulate some pre-booked slots (court id → set of "YYYY-MM-DD|HH:MM" keys)
const seed = [
  { court: 1, date: '2026-03-16', slot: '9:00 AM' },
  { court: 1, date: '2026-03-16', slot: '10:00 AM' },
  { court: 2, date: '2026-03-16', slot: '7:00 AM' },
  { court: 3, date: '2026-03-17', slot: '2:00 PM' },
  { court: 4, date: '2026-03-17', slot: '4:00 PM' },
  { court: 2, date: '2026-03-18', slot: '11:00 AM' },
  { court: 5, date: '2026-03-18', slot: '3:00 PM' },
]

export function buildBookedSet() {
  const set = new Set()
  seed.forEach(({ court, date, slot }) => set.add(`${court}|${date}|${slot}`))
  return set
}
