'use client'

import { Todo } from '@/types'
import TodoItem from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  todayCompletedCount: number
}

export default function TodoList({
  todos,
  onToggle,
  onDelete,
  todayCompletedCount
}: TodoListProps) {
  const pendingTodos = todos.filter(todo => !todo.completed)
  const completedTodos = todos.filter(todo => todo.completed)

  return (
    <div className="space-y-6">
      {/* 오늘 완료한 Todo 개수 표시 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">완료한 할일</span>
          </div>
          <span className="text-2xl font-bold text-green-800">
            {todayCompletedCount}
          </span>
        </div>
      </div>

      {/* 진행중인 할 일들 */}
      {pendingTodos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            진행중 ({pendingTodos.length})
          </h3>
          <div className="space-y-2">
            {pendingTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* 완료된 할 일들 */}
      {completedTodos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-500 mb-3">
            완료됨 ({completedTodos.length})
          </h3>
          <div className="space-y-2">
            {completedTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* 할 일이 없을 때 */}
      {todos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">할 일이 없습니다.</div>
          <div className="text-gray-300 text-sm mt-2">새로운 할 일을 추가해보세요!</div>
        </div>
      )}
    </div>
  )
}