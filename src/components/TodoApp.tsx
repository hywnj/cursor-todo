'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Todo } from '@/types'
import TodoForm from './TodoForm'
import TodoList from './TodoList'

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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
      const { data, error } = await supabase
        .from('todos')
        .insert([{ title, user_id: user.id }])
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
    return todos.filter(todo => {
      if (!todo.completed) return false
      const completedDate = new Date(todo.updated_at).toDateString()
      return completedDate === today
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Todo App</h1>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              로그아웃
            </button>
          </div>

          {/* Todo 추가 폼 */}
          <TodoForm onAdd={addTodo} />

          {/* Todo 리스트 */}
          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            todayCompletedCount={getTodayCompletedCount()}
          />
        </div>
      </div>
    </div>
  )
}