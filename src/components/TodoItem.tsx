'use client'

import { Todo } from '@/types'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => onToggle(todo.id, e.target.checked)}
        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <span
        className={`flex-1 text-sm ${
          todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
        }`}
      >
        {todo.title}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-red-500 hover:text-red-700 text-sm font-medium"
      >
        삭제
      </button>
    </div>
  )
}