import { ONE_DAY_MS, ONE_MINUTE_MS } from './constants'

const isDateBeforeToday = (dateToCheck: Date): boolean => {
  const today = new Date()
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )

  return dateToCheck < startOfToday
}

export const getCacheTime = (date: Date): number => {
  if (isDateBeforeToday(date)) return ONE_DAY_MS

  return ONE_MINUTE_MS
}

export const allowedIntervals = [
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'quarter',
]
