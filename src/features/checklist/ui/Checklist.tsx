import React, {useState} from 'react'
import clsx from 'clsx'
import isEmpty from 'lodash/fp/isEmpty'
import {XIcon, CheckIcon} from '@heroicons/react/solid'
import {Checkbox} from 'shared/ui/checkbox'
import {Spin} from 'shared/ui/spin'
import {TaskId, Todo} from 'modules/tasks/types.d'
import {TextArea} from 'modules/tasks/components'
import {useRemoveTodoMutation, usePatchTodoMutation} from '../model'

type Props = {
  taskId: TaskId
  checklist: Todo[]
}

type TodoProps = {
  taskId: TaskId
  todo: Todo
}

const TodoItem: React.FC<TodoProps> = ({taskId, todo}) => {
  const patchTodoMutation = usePatchTodoMutation(taskId)
  const removeTodoMutation = useRemoveTodoMutation(taskId)
  const [isFocused, setIsFocused] = useState(false)

  const isUpdateInProgress = patchTodoMutation.isLoading
  const isEditInProgress = !isUpdateInProgress && isFocused
  const isIdle = !isUpdateInProgress && !isFocused

  return (
    <li
      key={todo.id}
      className={clsx(
        'px-4 rounded-md flex items-center active:bg-gray-100 dark:active:bg-dark-500 transition',
        {
          'line-through': todo.is_completed,
        },
      )}
    >
      <label className="py-1 flex items-center">
        <Checkbox
          labeled
          isChecked={todo.is_completed}
          className="mr-3"
          size="md"
          onChange={() =>
            patchTodoMutation.mutate({
              todoId: todo.id,
              patch: {
                is_completed: !todo.is_completed,
              },
            })
          }
        />
      </label>
      <form onSubmit={e => e.preventDefault()}>
        <TextArea
          value={todo.title}
          onChange={newTitle => {
            patchTodoMutation.mutate({
              todoId: todo.id,
              patch: {
                title: newTitle,
              },
            })
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </form>
      <div className="-mr-3 ml-auto h-10 flex items-center">
        {isUpdateInProgress && (
          <div className="w-10 flex justify-center items-center">
            <Spin className="w-4 h-4 text-gray-300" />
          </div>
        )}
        {isEditInProgress && (
          <button
            className={clsx(
              'w-10',
              'flex items-center justify-center',
              'text-green-500 rounded',
              'transition ease-in duration-150',
              'active:text-green-600 active:bg-gray-100 dark:active:bg-dark-400',
              'focus:outline-none focus:bg-gray-200 focus:bg-opacity-75',
            )}
          >
            <CheckIcon className="w-4 h-4" />
          </button>
        )}
        {isIdle && (
          <button
            className={clsx(
              'w-10',
              'flex items-center justify-center',
              'text-red-500 rounded',
              'transition ease-in duration-150',
              'active:text-red-600 active:bg-gray-100 dark:active:bg-dark-400',
              'focus:outline-none focus:bg-gray-200 focus:bg-opacity-75',
            )}
            onClick={() => removeTodoMutation.mutate(todo.id)}
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </li>
  )
}

export const Checklist: React.FC<Props> = ({taskId, checklist}) => {
  if (isEmpty(checklist)) {
    return null
  }

  return (
    <ul className="mt-2 space-y-1">
      {checklist.map(todo => (
        <TodoItem key={todo.id} taskId={taskId} todo={todo} />
      ))}
    </ul>
  )
}
