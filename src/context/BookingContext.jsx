import { createContext, useContext, useState, useEffect } from 'react'
import { startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns'
import { START_TIMES, coveredIndices } from '../data/courts'

const BookingContext = createContext(null)
const API = '/api'

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    fetch(`${API}/bookings`)
      .then(r => r.json())
      .then(setBookings)
      .catch(() => setBookings([]))
  }, [])

  function getBookings() {
    return bookings
  }

  function getUserWeekBookings(userId, date) {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
    return bookings.filter(b =>
      b.userId === userId &&
      isWithinInterval(parseISO(b.date), { start: weekStart, end: weekEnd })
    )
  }

  function getUserWeekHours(userId, date) {
    return getUserWeekBookings(userId, date).reduce((sum, b) => sum + (b.duration || 1), 0)
  }

  function getBookedIndices(courtId, dateStr) {
    const booked = new Set()
    bookings
      .filter(b => b.courtId === courtId && b.date === dateStr)
      .forEach(b => coveredIndices(b.startSlot, b.duration).forEach(i => booked.add(i)))
    return booked
  }

  function isSlotAvailable(courtId, dateStr, startSlot, duration) {
    const booked = getBookedIndices(courtId, dateStr)
    return coveredIndices(startSlot, duration).every(i => !booked.has(i))
  }

  function getSlotBookerName(courtId, dateStr, startSlot) {
    const booking = bookings.find(b => {
      if (b.courtId !== courtId || b.date !== dateStr) return false
      const indices = coveredIndices(b.startSlot, b.duration || 1)
      return indices.includes(START_TIMES.indexOf(startSlot))
    })
    return booking ? booking.userName : null
  }

  function isConsecutiveBlocked(userId, dateStr, startSlot, duration) {
    const userBookings = bookings.filter(b => b.userId === userId && b.date === dateStr)
    if (userBookings.length === 0) return false
    const newStart = START_TIMES.indexOf(startSlot)
    const newEnd = newStart + duration
    return userBookings.some(b => {
      const bStart = START_TIMES.indexOf(b.startSlot)
      const bEnd = bStart + (b.duration || 1)
      return newStart === bEnd || newEnd === bStart
    })
  }

  async function addBooking({ userId, userName, userEmail, courtId, date, startSlot, duration, isResident, price }) {
    const res = await fetch(`${API}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName, userEmail, courtId, date, startSlot, duration, isResident, price }),
    })
    const data = await res.json()
    if (data.success) {
      setBookings(prev => [...prev, data.booking])
    }
  }

  function getUserBookings(userId) {
    return bookings.filter(b => b.userId === userId)
  }

  return (
    <BookingContext.Provider value={{
      bookings,
      getBookings,
      isSlotAvailable,
      isConsecutiveBlocked,
      getBookedIndices,
      getUserWeekHours,
      getUserWeekBookings,
      addBooking,
      getUserBookings,
      getSlotBookerName,
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBookings() {
  return useContext(BookingContext)
}
