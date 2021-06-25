import React, {ReactNode} from 'react'
import {Task} from '@/components/Task/Task'
import {TaskT} from '@/store/tasks'
import ContentLoader from 'react-content-loader'
import isEmpty from 'lodash/fp/isEmpty'
import times from 'lodash/fp/times'
import {InboxIcon} from '@heroicons/react/solid'
import {useMutation, useQueryClient} from 'react-query'
import {akira} from '@lib/akira/index'
import produce from 'immer'
import {findIndex, isUndefined, noop} from 'lodash/fp'

type Props = {
  isPending: boolean
  tasks: TaskT[]
  noTasksSlot?: ReactNode
}

export const Tasks: React.FC<Props> = ({isPending, tasks, noTasksSlot}) => {
  const queryClient = useQueryClient()
  const toggleTaskCompleteMutation = useMutation(akira.tasks.toggleCompleted, {
    onMutate(taskId) {
      const prevTask: Undefined<TaskT> = queryClient.getQueryData([
        'task',
        taskId
      ])

      if (prevTask) {
        const newTask = {
          ...prevTask,
          is_completed: !prevTask.is_completed
        }

        queryClient.setQueryData(['task', taskId], newTask)
        queryClient.setQueryData(
          'tasks:today',
          (oldTasks: Undefined<TaskT[]>) => {
            if (isUndefined(oldTasks)) {
              return []
            }

            return produce(oldTasks, draft => {
              const index = findIndex({id: taskId}, oldTasks)

              draft[index] = newTask
            })
          }
        )
      }

      return {prevTask}
    },
    onSuccess(task) {
      queryClient.setQueryData(['task', task.id], task)
    },
    onError(_, taskId, context: any) {
      if (context?.prevTask) {
        queryClient.setQueryData(['task', taskId], context.prevTask)
      }
    }
  })

  const removeTaskMutation = useMutation(akira.tasks.delete, {
    onSuccess(_, taskId) {
      queryClient.removeQueries(['task', taskId])
      queryClient.setQueryData(
        'tasks:today',
        (oldTasks: Undefined<TaskT[]>) => {
          if (isUndefined(oldTasks)) {
            return []
          }

          return produce(oldTasks, draft => {
            const index = findIndex({id: taskId}, oldTasks)
            draft.splice(index, 1)
          })
        }
      )
    }
  })

  const toggleImportantMutation = useMutation(akira.tasks.toggleImportant, {
    onMutate(taskId) {
      const prevTask: Undefined<TaskT> = queryClient.getQueryData([
        'task',
        taskId
      ])

      if (prevTask) {
        const newTask = {
          ...prevTask,
          is_important: !prevTask.is_important
        }

        queryClient.setQueryData(['task', taskId], newTask)
        queryClient.setQueryData(
          'tasks:today',
          (oldTasks: Undefined<TaskT[]>) => {
            if (isUndefined(oldTasks)) {
              return []
            }

            return produce(oldTasks, draft => {
              const index = findIndex({id: taskId}, oldTasks)

              draft[index] = newTask
            })
          }
        )
      }

      return {prevTask}
    },
    onSuccess(task) {
      queryClient.setQueryData(['task', task.id], task)
    },
    onError(_, taskId, context: any) {
      if (context?.prevTask) {
        queryClient.setQueryData(['task', taskId], context.prevTask)
      }
    }
  })

  if (isPending) {
    const taskHeight = 56
    const spacing = 4
    const count = 8
    const height = taskHeight * count + (count - 1) * spacing
    return (
      <section className="px-4">
        <ContentLoader
          speed={2}
          width="100%"
          height={height}
          backgroundColor="#ffffff"
          foregroundColor="#e9e9e9"
        >
          {times(
            n => (
              <rect
                key={n}
                x="0"
                y={n * taskHeight + n * spacing}
                rx="6"
                ry="6"
                width="100%"
                height={taskHeight}
              />
            ),
            count
          )}
        </ContentLoader>
      </section>
    )
  }

  if (isEmpty(tasks)) {
    return (
      <div className="flex flex-col justify-center items-center pt-12 text-gray-700">
        <InboxIcon className="w-12 h-12" />
        <h2 className="mt-2 font-semibold text-lg">No tasks</h2>
        {noTasksSlot}
      </div>
    )
  }

  return (
    <ul className="space-y-0.5 px-4">
      {tasks.map((task, index) => (
        <Task
          key={task.id}
          index={index}
          task={task}
          onCheck={toggleTaskCompleteMutation.mutate}
          onRemove={removeTaskMutation.mutate}
          onOrderChange={noop}
          onSetImportant={toggleImportantMutation.mutate}
        />
      ))}
    </ul>
  )
}
