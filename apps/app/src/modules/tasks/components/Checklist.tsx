import React from 'react'
import {useMutation, useQueryClient} from 'react-query'
import clsx from 'clsx'
import produce from 'immer'
import filter from 'lodash/fp/filter'
import findIndex from 'lodash/fp/findIndex'
import {XIcon} from '@heroicons/react/solid'

import {Checkbox} from '@components/Checkbox/Checkbox'
import {akira} from '@lib/akira'
import {TaskIdT, TaskT, TodoIdT, TodoPatchT, TodoT} from '@store/tasks'

type Props = {
  taskId: TaskIdT
  checklist: TodoT[]
}

export const Checklist: React.FC<Props> = ({taskId, checklist}) => {
  const queryClient = useQueryClient()
  const patchTodoMutation = useMutation(
    ({todoId, patch}: {todoId: TodoIdT; patch: TodoPatchT}) => {
      return akira.checklist.patchTodo(taskId, todoId, patch)
    },
    {
      onMutate({todoId, patch}) {
        const prevTask = queryClient.getQueryData<TaskT>(['task', taskId])

        if (prevTask) {
          queryClient.setQueryData(['task', taskId], () =>
            produce(prevTask, draft => {
              const index = findIndex({id: todoId}, prevTask.checklist)

              draft.checklist[index] = {
                ...prevTask.checklist[index],
                ...patch
              }
            })
          )
        }

        return {prevTask}
      },
      onError(_, todoId, context: any) {
        const prevTask = context?.prevTask

        if (prevTask) {
          queryClient.setQueryData(['task', taskId], prevTask)
        }
      }
    }
  )

  const removeTodoMutation = useMutation(
    (todoId: TodoIdT) => {
      return akira.checklist.removeTodo(taskId, todoId)
    },
    {
      onMutate(todoId) {
        const prevTask = queryClient.getQueryData<TaskT>(['task', taskId])

        if (prevTask) {
          queryClient.setQueryData(['task', taskId], () =>
            produce(prevTask, draft => {
              draft.checklist = filter(
                todo => todo.id !== todoId,
                draft.checklist
              )
            })
          )
        }

        return {prevTask}
      },
      onError(_, todoId, context: any) {
        const prevTask = context?.prevTask

        if (prevTask) {
          queryClient.setQueryData(['task', taskId], prevTask)
        }
      }
    }
  )

  return (
    <ul className="mt-2 divide-y transition ease-in duration-75">
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
