// Valid resident codes for Donnacona 2026 season.
// These codes are distributed to residents by the municipality.
export const RESIDENT_CODES = [
  'DONNA-2026-A1F3',
  'DONNA-2026-B2G7',
  'DONNA-2026-C3H9',
  'DONNA-2026-D4J2',
  'DONNA-2026-E5K6',
  'DONNA-2026-F6L8',
  'DONNA-2026-G7M1',
  'DONNA-2026-H8N4',
  'DONNA-2026-I9P5',
  'DONNA-2026-J0Q3',
  'DONNA-2026-K1R7',
  'DONNA-2026-L2S0',
  'DONNA-2026-M3T4',
  'DONNA-2026-N4U8',
  'DONNA-2026-O5V2',
  'DONNA-2026-P6W9',
  'DONNA-2026-Q7X1',
  'DONNA-2026-R8Y6',
  'DONNA-2026-S9Z3',
  'DONNA-2026-T0A5',
  'DONNA-2026-U1B8',
  'DONNA-2026-V2C2',
  'DONNA-2026-W3D7',
  'DONNA-2026-X4E0',
  'DONNA-2026-Y5F4',
  'DONNA-2026-Z6G9',
  'DONNA-2026-AA7H',
  'DONNA-2026-BB8I',
  'DONNA-2026-CC9J',
  'DONNA-2026-DD0K',
]

// Check if a code is valid (exists in list)
export function isValidCode(code) {
  return RESIDENT_CODES.includes(code.trim().toUpperCase())
}

// Check if a code has already been claimed by another user
export function isCodeClaimed(code, currentUserId) {
  try {
    const claimed = JSON.parse(localStorage.getItem('pb_claimed_codes') || '{}')
    const claimedBy = claimed[code.trim().toUpperCase()]
    return claimedBy !== undefined && claimedBy !== currentUserId
  } catch { return false }
}

// Claim a code for a user
export function claimCode(code, userId) {
  try {
    const claimed = JSON.parse(localStorage.getItem('pb_claimed_codes') || '{}')
    claimed[code.trim().toUpperCase()] = userId
    localStorage.setItem('pb_claimed_codes', JSON.stringify(claimed))
  } catch {}
}
