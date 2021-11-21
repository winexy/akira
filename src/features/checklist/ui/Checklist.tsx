import React from 'react'
import clsx from 'clsx'
import isEmpty from 'lodash/fp/isEmpty'
import {XIcon} from '@heroicons/react/solid'

import {Checkbox} from 'shared/ui/checkbox'
import {TaskId, Todo} from 'modules/tasks/types.d'
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
    <ul className="mt-2 px-4 space-y-1">
      {checklist.map(todo => (
        <li
          key={todo.id}
          className={clsx('rounded-md flex', {
            'line-through': todo.is_completed
          })}
        >
          <div className="py-1 flex items-center">
            <Checkbox
              isChecked={todo.is_completed}
              className="mr-3"
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
          </div>
          <button
            className={clsx(
              'ml-auto -mr-3 w-10 h-10',
              'flex items-center justify-center',
              'text-red-500 rounded',
              'transition ease-in duration-150',
              'active:text-red-600 active:bg-gray-100 dark:active:bg-dark-400',
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
