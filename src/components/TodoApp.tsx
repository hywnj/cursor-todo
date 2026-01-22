'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Todo } from '@/types'
import TodoForm from './TodoForm'
import TodoList from './TodoList'
import Calendar from './Calendar'

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [currentViewDate, setCurrentViewDate] = useState(new Date())

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 모바일 감지 및 화면 크기 변경 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 230) // 230px 이하를 모바일로 간주
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (user) {
      fetchTodos()
    } else {
      setTodos([])
      setLoading(false)
    }
  }, [user])

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (title: string) => {
    if (!user) return

    try {
      // 모바일에서는 현재 보고 있는 날짜에, 데스크톱에서는 오늘 날짜에 추가
      const targetDate = isMobile ? currentViewDate : new Date()

      const { data, error } = await supabase
        .from('todos')
        .insert([{ title, user_id: user.id, created_at: targetDate.toISOString() }])
        .select()
        .single()

      if (error) throw error
      setTodos(prev => [data, ...prev])
    } catch (error) {
      console.error('Error adding todo:', error)
      alert('할 일 추가에 실패했습니다.')
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed })
        .eq('id', id)

      if (error) throw error
      setTodos(prev =>
        prev.map(todo =>
          todo.id === id ? { ...todo, completed } : todo
        )
      )
    } catch (error) {
      console.error('Error toggling todo:', error)
      alert('할 일 상태 변경에 실패했습니다.')
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTodos(prev => prev.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
      alert('할 일 삭제에 실패했습니다.')
    }
  }

  const getTodayTodos = () => {
    const today = new Date().toDateString()
    return todos.filter(todo => {
      const todoDate = new Date(todo.created_at).toDateString()
      return todoDate === today
    })
  }

  const getCurrentViewTodos = () => {
    const viewDate = currentViewDate.toDateString()
    return todos.filter(todo => {
      const todoDate = new Date(todo.created_at).toDateString()
      return todoDate === viewDate
    })
  }

  // 모바일 날짜 이동 함수들
  const goToPreviousDay = () => {
    setCurrentViewDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() - 1)
      return newDate
    })
  }

  const goToNextDay = () => {
    setCurrentViewDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + 1)
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentViewDate(new Date())
  }

  const getTodayCompletedCount = () => {
    const today = new Date().toDateString()
    return todos.filter(todo => {
      if (!todo.completed) return false
      const completedDate = new Date(todo.updated_at).toDateString()
      return completedDate === today
    }).length
  }

  const getCurrentViewCompletedCount = () => {
    const viewDate = currentViewDate.toDateString()
    return todos.filter(todo => {
      if (!todo.completed) return false
      const completedDate = new Date(todo.updated_at).toDateString()
      return completedDate === viewDate
    }).length
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (!user) {
    return <div>Loading...</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩중...</div>
      </div>
    )
  }

  // 모바일용 날짜 포맷 함수 (간결하게 표시)
  const formatMobileDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short' })
    return `${year}.${month}.${day}(${weekday})`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Todo App</h1>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1 rounded-md hover:bg-gray-100"
          >
            로그아웃
          </button>
        </div>

        {isMobile ? (
          /* 모바일 레이아웃 (640px 이하) */
          <div className="space-y-4">
            {/* 날짜 네비게이션 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={goToPreviousDay}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="이전 날짜"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatMobileDate(currentViewDate)}
                  </div>
                  {currentViewDate.toDateString() !== new Date().toDateString() && (
                    <button
                      onClick={goToToday}
                      className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                    >
                      오늘로 돌아가기
                    </button>
                  )}
                </div>

                <button
                  onClick={goToNextDay}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="다음 날짜"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Todo 추가 폼 */}
              <TodoForm onAdd={addTodo} />
            </div>

            {/* 해당 날짜 할일 리스트 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <TodoList
                todos={getCurrentViewTodos()}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                todayCompletedCount={getCurrentViewCompletedCount()}
              />

              {getCurrentViewTodos().length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg">할 일이 없습니다.</div>
                  <div className="text-gray-300 text-sm mt-2">새로운 할 일을 추가해보세요!</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 데스크톱 레이아웃 (640px 초과) */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 캘린더 - 더 큰 영역 차지 */}
            <div className="bg-white rounded-lg shadow-sm">
              <Calendar />
            </div>

            {/* 오늘 할일 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">오늘 할 일</h2>

              {/* Todo 추가 폼 */}
              <div className="mb-4">
                <TodoForm onAdd={addTodo} />
              </div>

              {/* 오늘 할일 리스트 */}
              <TodoList
                todos={getTodayTodos()}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                todayCompletedCount={getTodayCompletedCount()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}