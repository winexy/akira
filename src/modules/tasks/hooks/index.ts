import produce from 'immer'
import findIndex from 'lodash/fp/findIndex'
import isUndefined from 'lodash/fp/isUndefined'
import {useMutation, useQueryClient} from 'react-query'
import {akira} from '@lib/akira'
import {TaskT} from '@store/tasks/types'

export function useToggleCompletedMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.toggleCompleted, {
    onMutate(taskId) {
      const prevTask = queryClient.getQueryData<TaskT>(['task', taskId])

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
}

export function useToggleImportantMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.toggleImportant, {
    onMutate(taskId) {
      const prevTask = queryClient.getQueryData<TaskT>(['task', taskId])

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
}
