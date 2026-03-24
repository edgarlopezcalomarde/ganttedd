import {
  startOfMonth,
  startOfWeek,
  startOfDay,
  addMonths,
  endOfMonth,
  differenceInDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  getDaysInMonth,
  format,
  formatDistance,
  parseISO,
  isToday,
  isSunday,
  getWeek,
  max,
  min,
  addDays,
  getDay
} from 'date-fns'

const ZOOM_LEVELS = {
  day: 50,
  week: 24,
  month: 140,
  year: 90
}

export function getDayWidth(zoom = 'month') {
  if (zoom === 'month') return 140
  if (zoom === 'year') return 90
  return ZOOM_LEVELS[zoom] || ZOOM_LEVELS.month
}

// Returns pixels per calendar day for each zoom level
// month: dayWidth is "per 7 days" → dayWidth/7
// year:  dayWidth is "per 30 days" → dayWidth/30
// day:   dayWidth is already "per day"
function getPxPerDay(zoom, dayWidth) {
  if (zoom === 'month') return dayWidth / 7
  if (zoom === 'year') return dayWidth / 30
  return dayWidth
}

export function getViewRangeFromTasks(tasks, zoom = 'month', overrideDayWidth = null) {
  let viewStart, viewEnd

  if (tasks.length === 0) {
    viewStart = startOfMonth(new Date())
    viewEnd = endOfMonth(addMonths(new Date(), 2))
  } else {
    const startDates = tasks.map(t => parseISO(t.startDate))
    const endDates = tasks.map(t => parseISO(t.endDate))
    const minDate = min(startDates)
    const maxDate = max(endDates)
    viewStart = addDays(minDate, -3)
    viewEnd = addDays(maxDate, 3)
  }

  const totalDays = differenceInDays(viewEnd, viewStart) + 1
  const dayWidth = overrideDayWidth !== null ? overrideDayWidth : getDayWidth(zoom)
  const pxPerDay = getPxPerDay(zoom, dayWidth)
  const totalWidth = totalDays * pxPerDay

  return {
    viewStart,
    viewEnd,
    totalDays,
    zoom,
    dayWidth,
    pxPerDay,
    totalWidth
  }
}

export function getMonthHeaders(tasks, zoom = 'month', overrideDayWidth = null) {
  const { viewStart, viewEnd, dayWidth } = getViewRangeFromTasks(tasks, zoom, overrideDayWidth)
  const pxPerDay = getPxPerDay(zoom, dayWidth)

  if (zoom === 'month' || zoom === 'day') {
    const months = eachMonthOfInterval({ start: viewStart, end: viewEnd })
    return months.map((month) => {
      const monthStart = max([startOfMonth(month), viewStart])
      const monthEnd = min([endOfMonth(month), viewEnd])
      const daysInRange = differenceInDays(monthEnd, monthStart) + 1
      return {
        label: format(month, 'MMMM'),
        widthPx: daysInRange * pxPerDay
      }
    })
  }

  if (zoom === 'year') {
    const years = new Set()
    let current = new Date(viewStart)
    while (current <= viewEnd) {
      years.add(current.getFullYear())
      current = new Date(current.getFullYear() + 1, 0, 1)
    }
    const yearArray = Array.from(years).sort((a, b) => a - b)
    return yearArray.map((year) => {
      const yearStart = max([new Date(year, 0, 1), viewStart])
      const yearEnd = min([new Date(year, 11, 31), viewEnd])
      const daysInRange = differenceInDays(yearEnd, yearStart) + 1
      return {
        label: year.toString(),
        widthPx: daysInRange * pxPerDay
      }
    })
  }

  return []
}

export function getDayHeaders(tasks, zoom = 'month', overrideDayWidth = null) {
  const { viewStart, viewEnd, dayWidth } = getViewRangeFromTasks(tasks, zoom, overrideDayWidth)
  const pxPerDay = getPxPerDay(zoom, dayWidth)

  if (zoom === 'day') {
    const days = eachDayOfInterval({ start: viewStart, end: viewEnd })
    return days.map((day) => ({
      type: 'day',
      label: format(day, 'd'),
      subLabel: format(day, 'EEE'),
      date: day,
      isToday: isToday(day),
      isSunday: isSunday(day),
      dayOfMonth: format(day, 'd'),
      width: pxPerDay
    }))
  }

  if (zoom === 'month') {
    const months = eachMonthOfInterval({ start: viewStart, end: viewEnd })
    const weeks = []
    for (const month of months) {
      const monthStart = max([startOfMonth(month), viewStart])
      const monthEnd = min([endOfMonth(month), viewEnd])
      let current = startOfWeek(monthStart)
      let weekNum = 1
      while (current <= monthEnd) {
        const weekStart = max([current, monthStart])
        const weekEnd = min([addDays(current, 6), monthEnd])
        const daysInWeek = differenceInDays(weekEnd, weekStart) + 1
        weeks.push({
          type: 'week',
          label: `S${weekNum}`,
          date: current,
          isToday: isToday(current),
          width: daysInWeek * pxPerDay
        })
        weekNum++
        current = addDays(current, 7)
      }
    }
    return weeks
  }

  if (zoom === 'year') {
    const years = new Set()
    let current = new Date(viewStart)
    while (current <= viewEnd) {
      years.add(current.getFullYear())
      current = new Date(current.getFullYear() + 1, 0, 1)
    }
    const yearArray = Array.from(years).sort((a, b) => a - b)
    const months = []
    for (const year of yearArray) {
      const yearStart = max([new Date(year, 0, 1), viewStart])
      const yearEnd = min([new Date(year, 11, 31), viewEnd])
      const monthsInYear = eachMonthOfInterval({ start: yearStart, end: yearEnd })
      for (const month of monthsInYear) {
        const monthStart = max([startOfMonth(month), yearStart])
        const monthEnd = min([endOfMonth(month), yearEnd])
        const daysInMonth = differenceInDays(monthEnd, monthStart) + 1
        months.push({
          type: 'month',
          label: format(month, 'MMM'),
          date: month,
          isToday: isToday(month),
          width: daysInMonth * pxPerDay
        })
      }
    }
    return months
  }

  return []
}

export function getTodayOffset(tasks, zoom = 'month') {
  const { viewStart, totalDays } = getViewRangeFromTasks(tasks, zoom)
  const today = new Date()
  const offset = differenceInDays(today, viewStart)
  return (offset / totalDays) * 100
}

export function getBarStyle(task, viewStart, viewEnd, totalDays, dayWidth, zoom = 'month') {
  try {
    const taskStart = parseISO(task.startDate)
    const taskEnd = parseISO(task.endDate)

    const clampedStart = max([taskStart, viewStart])
    const clampedEnd = min([taskEnd, viewEnd])

    if (clampedStart > clampedEnd) return null

    const pxPerDay = getPxPerDay(zoom, dayWidth)
    const offsetDays = differenceInDays(clampedStart, viewStart)
    const durationDays = differenceInDays(clampedEnd, clampedStart) + 1

    return {
      left: `${offsetDays * pxPerDay}px`,
      width: `${Math.max(durationDays, 1) * pxPerDay}px`
    }
  } catch {
    return null
  }
}

export const ZOOM_LEVELS_EXPORT = ZOOM_LEVELS
