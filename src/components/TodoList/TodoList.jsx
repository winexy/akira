import React from 'react'
import {TodoItem} from '@components/TodoItem/TodoItem'

export function TodoList({list, onCheck, onRemove, onOrderChange}) {
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
