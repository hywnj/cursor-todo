'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CalendarProps {
  selectedDate?: Date
  onDateChange?: (date: Date) => void
}

export default function Calendar({ selectedDate, onDateChange }: CalendarProps) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDateState, setSelectedDateState] = useState<Date | null>(null)

  const today = new Date()

  // 월 변경 함수
  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  // 해당 월의 날짜들 계산
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    // 이전 달의 마지막 날짜들
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    const startDayOfWeek = firstDay.getDay() // 0: 일요일, 1: 월요일, ...

    const days = []

    // 이전 달 날짜들 추가
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i
      days.push({
        day,
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      })
    }

    // 현재 달 날짜들 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = date.toDateString() === today.toDateString()
      const isSelected = selectedDateState ? date.toDateString() === selectedDateState.toDateString() : false

      days.push({
        day,
        date,
        isCurrentMonth: true,
        isToday,
        isSelected
      })
    }

    // 다음 달 날짜들 추가 (42개 셀 채우기)
    const remainingCells = 42 - days.length
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      })
    }

    return days
  }

  const handleDateClick = (date: Date) => {
    setSelectedDateState(date)
    if (onDateChange) {
      onDateChange(date)
    } else {
      // 메인 페이지에서는 날짜 클릭시 해당 날짜 페이지로 이동
      // toLocaleDateString('en-CA')로 로컬 시간 기준 YYYY-MM-DD 형식 사용
      const dateString = date.toLocaleDateString('en-CA') // YYYY-MM-DD 형식
      router.push(`/${dateString}`)
    }
  }

  const days = getDaysInMonth(currentDate)
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 w-full max-w-md mx-auto shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth('prev')}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200"
          aria-label="이전 달"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-gray-900">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>

        <button
          onClick={() => changeMonth('next')}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200"
          aria-label="다음 달"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-medium py-2 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayInfo, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(dayInfo.date)}
            className={`
              h-10 w-10 text-sm font-medium rounded-md transition-all duration-200 relative
              ${dayInfo.isCurrentMonth
                ? 'text-gray-900 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm'
                : 'text-gray-400 hover:bg-gray-50'
              }
              ${dayInfo.isToday
                ? 'bg-blue-100 text-blue-700 font-bold ring-2 ring-blue-300 shadow-sm'
                : ''
              }
              ${dayInfo.isSelected
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform scale-105'
                : ''
              }
            `}
            disabled={!dayInfo.isCurrentMonth}
            aria-label={`${dayInfo.date.getFullYear()}년 ${dayInfo.date.getMonth() + 1}월 ${dayInfo.day}일`}
          >
            {dayInfo.day}
            {dayInfo.isToday && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* 오늘로 돌아가기 버튼 */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => setCurrentDate(new Date())}
          className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 font-medium"
        >
          오늘로 돌아가기
        </button>
      </div>
    </div>
  )
}