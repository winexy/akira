import React from 'react'
import clsx from 'clsx'
import isEmpty from 'lodash/fp/isEmpty'
import {XIcon} from '@heroicons/react/solid'

import {Checkbox} from 'shared/ui/checkbox'
import {TaskId, Todo} from 'modules/tasks/types.d'
import {List} from 'shared/ui/list'
import {useRemoveTodoMutation, usePatchTodoMutation} from '../model'

type Props = {
  taskId: TaskId
  checklist: Todo[]
}

export const Checklist: React.FC<Props> = ({taskId, checklist}) => {
  const patchTodoMutation = usePatchTodoMutation(taskId)
  const removeTodoMutation = useRemoveTodoMutation(taskId)

  if (isEmpty(checklist)) {
    return null
  }

  return (
    <List className="mt-2">
      {checklist.map(todo => (
        <List.Item
          key={todo.id}
          className={clsx('px-4 py-1', {'line-through': todo.is_completed})}
        >
          <Checkbox
            isChecked={todo.is_completed}
            className="mr-4"
            size="sm"
            onChange={() =>
              patchTodoMutation.mutate({
                todoId: todo.id,
                patch: {
                  is_completed: !todo.is_completed
                }
              })
            }
          />
          {todo.title}
          <button
            className={clsx(
              'ml-auto -mr-3 w-10 h-10',
              'flex items-center justify-center',
              'text-red-500 rounded',
              'transition ease-in duration-150',
              'active:text-red-600 active:bg-gray-300',
              'focus:outline-none focus:bg-gray-200 focus:bg-opacity-75'
            )}
            onClick={() => removeTodoMutation.mutate(todo.id)}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </List.Item>
      ))}
    </List>
  )
}
