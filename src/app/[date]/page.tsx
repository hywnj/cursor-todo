'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Todo } from '@/types'
import TodoForm from '@/components/TodoForm'
import TodoList from '@/components/TodoList'

export default function DatePage() {
  const params = useParams()
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const dateString = params.date as string
  // URL 파라미터에서 날짜를 안전하게 파싱 (시간대 문제 방지)
  const [year, month, day] = dateString.split('-').map(Number)
  const selectedDate = new Date(year, month - 1, day)

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

  useEffect(() => {
    if (user) {
      fetchTodos()
    } else {
      setTodos([])
      setLoading(false)
    }
  }, [user, dateString])

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

  // 선택된 날짜의 Todo들만 필터링 (시간대 문제 방지를 위해 연/월/일만 비교)
  const filteredTodos = todos.filter(todo => {
    const todoDate = new Date(todo.created_at)
    const todoYear = todoDate.getFullYear()
    const todoMonth = todoDate.getMonth()
    const todoDay = todoDate.getDate()

    const selectedYear = selectedDate.getFullYear()
    const selectedMonth = selectedDate.getMonth()
    const selectedDay = selectedDate.getDate()

    return todoYear === selectedYear && todoMonth === selectedMonth && todoDay === selectedDay
  })

  const addTodo = async (title: string) => {
    if (!user) return

    try {
      // 선택된 날짜의 시작 시간(00:00:00)으로 created_at 설정
      const createdAt = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0)

      const { data, error } = await supabase
        .from('todos')
        .insert([{ title, user_id: user.id, created_at: createdAt.toISOString() }])
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

  const getTodayCompletedCount = () => {
    const today = new Date().toDateString()
    return filteredTodos.filter(todo => {
      if (!todo.completed) return false
      const completedDate = new Date(todo.updated_at).toDateString()
      return completedDate === today
    }).length
  }

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }
    return date.toLocaleDateString('ko-KR', options)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">로딩중...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">로딩중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* 네비게이션 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← 메인으로 돌아가기
          </button>
          <div className="text-sm text-gray-500">
            {formatDate(selectedDate)}
          </div>
        </div>

        {/* 날짜별 Todo */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {formatDate(selectedDate)}
          </h1>

          {/* Todo 추가 폼 */}
          <div className="mb-6">
            <TodoForm onAdd={addTodo} />
          </div>

          {/* 해당 날짜의 Todo 리스트 */}
          <TodoList
            todos={filteredTodos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            todayCompletedCount={getTodayCompletedCount()}
          />

          {filteredTodos.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">이 날짜에 할 일이 없습니다.</div>
              <div className="text-gray-300 text-sm mt-2">새로운 할 일을 추가해보세요!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}