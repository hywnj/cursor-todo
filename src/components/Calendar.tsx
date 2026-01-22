'use client'

import { useState } from 'react'
import ReactCalendar from 'react-calendar'
import { useRouter } from 'next/navigation'

type CalendarValue = Date | Date[] | null

interface CalendarProps {
  selectedDate?: Date
  onDateChange?: (date: Date) => void
}

export default function Calendar({ selectedDate, onDateChange }: CalendarProps) {
  const router = useRouter()
  const [date, setDate] = useState<Date>(selectedDate || new Date())

  const handleDateChange = (value: CalendarValue, event: React.MouseEvent<HTMLButtonElement>) => {
    if (value instanceof Date) {
      setDate(value)
      if (onDateChange) {
        onDateChange(value)
      } else {
        // 메인 페이지에서는 날짜 클릭시 해당 날짜 페이지로 이동
        const dateString = value.toISOString().split('T')[0] // YYYY-MM-DD 형식
        router.push(`/${dateString}`)
      }
    }
  }

  // 오늘 날짜 표시를 위한 커스텀 클래스
  const tileClassName = ({ date: tileDate, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const today = new Date()
      const isToday = tileDate.toDateString() === today.toDateString()
      return isToday ? 'today-highlight' : null
    }
    return null
  }

  return (
    <div className="calendar-container">
      <style jsx>{`
        .calendar-container :global(.react-calendar) {
          width: 100%;
          max-width: 350px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-family: inherit;
          line-height: 1.125em;
        }

        .calendar-container :global(.react-calendar__tile) {
          padding: 0.75em 0.5em;
          background: none;
          text-align: center;
          border-radius: 0.25rem;
          transition: background-color 0.2s ease;
        }

        .calendar-container :global(.react-calendar__tile:hover) {
          background-color: #f3f4f6;
        }

        .calendar-container :global(.react-calendar__tile--active) {
          background-color: #3b82f6 !important;
          color: white;
        }

        .calendar-container :global(.react-calendar__tile--now) {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .calendar-container :global(.today-highlight) {
          background-color: #fef3c7 !important;
          color: #92400e;
        }

        .calendar-container :global(.react-calendar__month-view__days__day--weekend) {
          color: #dc2626;
        }

        .calendar-container :global(.react-calendar__navigation) {
          margin-bottom: 1em;
        }

        .calendar-container :global(.react-calendar__navigation button) {
          color: #374151;
          border: none;
          background: none;
          font-size: 1.1em;
          font-weight: 600;
        }

        .calendar-container :global(.react-calendar__navigation button:hover) {
          background-color: #f3f4f6;
        }

        .calendar-container :global(.react-calendar__month-view__weekdays) {
          text-transform: uppercase;
          font-weight: 600;
          font-size: 0.75em;
          color: #6b7280;
        }
      `}</style>

      <ReactCalendar
        onChange={handleDateChange}
        value={date}
        locale="ko-KR"
        tileClassName={tileClassName}
        showNeighboringMonth={false}
      />
    </div>
  )
}