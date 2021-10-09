import React from 'react'
import clsx from 'clsx'
import isEmpty from 'lodash/fp/isEmpty'
import {XIcon} from '@heroicons/react/solid'

import {Checkbox} from 'shared/ui/checkbox'
import {TaskId, Todo} from 'modules/tasks/types.d'
import {useRemoveTodoMutation, usePatchTodoMutation} from '../hooks'

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
    <ul className="mt-2 divide-y dark:divide-dark-500 transition ease-in duration-75">
      {checklist.map(todo => (
        <li
          key={todo.id}
          className={clsx(
            'flex items-center px-4 py-1',
            'select-none',
            'transitino ease-in duration-150',
            'active:bg-gray-200',
            {'line-through': todo.is_completed}
          )}
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
        </li>
      ))}
    </ul>
  )
}
