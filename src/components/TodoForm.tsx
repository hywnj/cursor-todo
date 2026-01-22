'use client'

import { useState } from 'react'

interface TodoFormProps {
  onAdd: (title: string) => void
  isLoading?: boolean
}

export default function TodoForm({ onAdd, isLoading = false }: TodoFormProps) {
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onAdd(title.trim())
      setTitle('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="새로운 할 일을 입력하세요..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!title.trim() || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isLoading ? '추가중...' : '추가'}
        </button>
      </div>
    </form>
  )
}