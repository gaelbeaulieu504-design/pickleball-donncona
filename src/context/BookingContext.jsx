import { createContext, useContext, useState } from 'react'
import { startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns'
import { TIME_SLOTS } from '../data/courts'

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [, forceUpdate] = useState(0)

  function getBookings() {
    try { return JSON.parse(localStorage.getItem('pb_bookings') || '[]') } catch { return [] }
  }

  function saveBookings(bookings) {
    localStorage.setItem('pb_bookings', JSON.stringify(bookings))
    forceUpdate(n => n + 1)
  }

  // Get all bookings for a user in the current ISO week containing `date`
  function getUserWeekBookings(userId, date) {
    const bookings = getBookings()
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
    return bookings.filter(b =>
      b.userId === userId &&
      isWithinInterval(parseISO(b.date), { start: weekStart, end: weekEnd })
    )
  }

  // Hours used this week (each booking = 2 hours)
  function getUserWeekHours(userId, date) {
    return getUserWeekBookings(userId, date).length * 2
  }

  // Check if slot is booked by anyone on a given court/date
  function isSlotBooked(courtId, date, slot) {
    const bookings = getBookings()
    const dateStr = typeof date === 'string' ? date : date.toISOString().slice(0, 10)
    return bookings.some(b => b.courtId === courtId && b.date === dateStr && b.slot === slot)
  }

  // Check if a user already has a booking on this date (consecutive rule)
  // Returns set of slot indices the user has booked on that date
  function getUserDaySlotIndices(userId, dateStr) {
    const bookings = getBookings()
    return bookings
      .filter(b => b.userId === userId && b.date === dateStr)
      .map(b => TIME_SLOTS.indexOf(b.slot))
      .filter(i => i !== -1)
  }

  // Whether a slot is blocked for user due to consecutive rule
  function isConsecutiveBlocked(userId, dateStr, slot) {
    const idx = TIME_SLOTS.indexOf(slot)
    if (idx === -1) return false
    const userIndices = getUserDaySlotIndices(userId, dateStr)
    return userIndices.some(i => Math.abs(i - idx) <= 1)
  }

  function addBooking({ userId, userName, userEmail, courtId, date, slot, isResident, price }) {
    const bookings = getBookings()
    bookings.push({
      id: Date.now().toString(),
      userId, userName, userEmail,
      courtId, date, slot,
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
      isSlotBooked,
      isConsecutiveBlocked,
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
