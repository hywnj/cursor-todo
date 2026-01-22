'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Auth from '@/components/Auth'
import TodoApp from '@/components/TodoApp'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">로딩중...</div>
      </div>
    )
  }

  return user ? <TodoApp /> : <Auth onAuthSuccess={() => setUser(true)} />
}
