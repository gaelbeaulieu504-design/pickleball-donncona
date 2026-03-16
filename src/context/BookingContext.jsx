import { createContext, useContext, useState } from 'react'
import { startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns'
import { START_TIMES, coveredIndices, buildInitialBookings } from '../data/courts'

const BookingContext = createContext(null)

function loadBookings() {
  try {
    const stored = localStorage.getItem('pb_bookings')
    if (stored) return JSON.parse(stored)
    // First load: seed with demo bookings
    const seed = buildInitialBookings()
    localStorage.setItem('pb_bookings', JSON.stringify(seed))
    return seed
  } catch { return [] }
}

export function BookingProvider({ children }) {
  const [, forceUpdate] = useState(0)

  function getBookings() {
    try { return JSON.parse(localStorage.getItem('pb_bookings') || '[]') } catch { return [] }
  }

  function saveBookings(bookings) {
    localStorage.setItem('pb_bookings', JSON.stringify(bookings))
    forceUpdate(n => n + 1)
  }

  // Get bookings for a user in the ISO week containing `date`
  function getUserWeekBookings(userId, date) {
    const bookings = getBookings()
    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
    return bookings.filter(b =>
      b.userId === userId &&
      isWithinInterval(parseISO(b.date), { start: weekStart, end: weekEnd })
    )
  }

  // Total hours booked this week
  function getUserWeekHours(userId, date) {
    return getUserWeekBookings(userId, date).reduce((sum, b) => sum + (b.duration || 1), 0)
  }

  // Returns array of booked 1h-slot indices for a court on a date
  function getBookedIndices(courtId, dateStr) {
    const bookings = getBookings()
    const booked = new Set()
    bookings
      .filter(b => b.courtId === courtId && b.date === dateStr)
      .forEach(b => coveredIndices(b.startSlot, b.duration).forEach(i => booked.add(i)))
    return booked
  }

  // Is a start slot (with given duration) available on a court?
  function isSlotAvailable(courtId, dateStr, startSlot, duration) {
    const booked = getBookedIndices(courtId, dateStr)
    return coveredIndices(startSlot, duration).every(i => !booked.has(i))
  }

  // Would booking this slot for this user violate the no-consecutive rule?
  // A user cannot book a slot that starts immediately when one of their bookings ends,
  // or ends exactly when one of theirs starts.
  function isConsecutiveBlocked(userId, dateStr, startSlot, duration) {
    const bookings = getBookings()
    const userBookings = bookings.filter(b => b.userId === userId && b.date === dateStr)
    if (userBookings.length === 0) return false

    const newStart = START_TIMES.indexOf(startSlot)
    const newEnd = newStart + duration

    return userBookings.some(b => {
      const bStart = START_TIMES.indexOf(b.startSlot)
      const bEnd = bStart + (b.duration || 1)
      // Adjacent = new booking starts right when existing ends, or vice versa
      return newStart === bEnd || newEnd === bStart
    })
  }

  function addBooking({ userId, userName, userEmail, courtId, date, startSlot, duration, isResident, price }) {
    const bookings = getBookings()
    bookings.push({
      id: Date.now().toString(),
      userId, userName, userEmail,
      courtId, date, startSlot, duration,
      isResident, price,
      createdAt: new Date().toISOString(),
    })
    saveBookings(bookings)
  }

  function getUserBookings(userId) {
    return getBookings().filter(b => b.userId === userId)
  }

  return (
    <BookingContext.Provider value={{
      getBookings,
      isSlotAvailable,
      isConsecutiveBlocked,
      getBookedIndices,
      getUserWeekHours,
      getUserWeekBookings,
      addBooking,
      getUserBookings,
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBookings() {
  return useContext(BookingContext)
}
