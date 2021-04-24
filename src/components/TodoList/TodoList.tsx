import React from 'react'
import {TodoItem} from '@components/TodoItem/TodoItem'
import {TodoItemT} from '@/models/TodoItem'

type TodoListProps = {
  list: TodoItemT[]
  onCheck(newState: TodoItemT['id']): void
  onRemove(id: TodoItemT['id']): void
  onOrderChange(dragIndex: number, hoverIndex: number): void
}

export const TodoList: React.FC<TodoListProps> = ({
  list,
  onCheck,
  onRemove,
  onOrderChange
}) => {
  return (
    <ul className="space-y-1 px-4">
      {list.map((item, index) => (
        <TodoItem
          key={item.id}
          item={item}
          index={index}
          onCheck={onCheck}
          onRemove={onRemove}
          onOrderChange={onOrderChange}
        />
      ))}
    </ul>
  )
}
