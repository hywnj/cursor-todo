'use client'

import { useRouter } from 'next/navigation'

interface CalendarProps {
  selectedDate?: Date
  onDateChange?: (date: Date) => void
}

export default function Calendar({ selectedDate, onDateChange }: CalendarProps) {
  const router = useRouter()

  const getDateString = (date: Date) => {
    return date.toISOString().split('T')[0] // YYYY-MM-DD 형식
  }

  const navigateToDate = (date: Date) => {
    if (onDateChange) {
      onDateChange(date)
    } else {
      const dateString = getDateString(date)
      router.push(`/${dateString}`)
    }
  }

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return (
    <div className="calendar-simple">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">빠른 날짜 선택</h3>
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => navigateToDate(yesterday)}
          className="px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors duration-200 border border-blue-200"
        >
          어제 ({getDateString(yesterday)})
        </button>
        <button
          onClick={() => navigateToDate(today)}
          className="px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors duration-200 border border-green-200"
        >
          오늘 ({getDateString(today)})
        </button>
        <button
          onClick={() => navigateToDate(tomorrow)}
          className="px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-medium transition-colors duration-200 border border-purple-200"
        >
          내일 ({getDateString(tomorrow)})
        </button>
      </div>
    </div>
  )
}