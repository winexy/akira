import produce from 'immer'
import findIndex from 'lodash/fp/findIndex'
import {useMutation, useQueryClient} from 'react-query'
import {akira} from '@lib/akira'
import {TaskT} from '@store/tasks/types'

export function useToggleCompletedMutation(tasksQueryKey: string) {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.toggleCompleted, {
    onMutate(taskId) {
      const prevTask = queryClient.getQueryData<TaskT>(['task', taskId])
      const prevTasks = queryClient.getQueryData<TaskT[]>(tasksQueryKey)

      if (prevTask) {
        const newTask = {
          ...prevTask,
          is_completed: !prevTask.is_completed
        }

        queryClient.setQueryData(['task', taskId], newTask)

        if (prevTasks) {
          queryClient.setQueryData(
            tasksQueryKey,
            produce(prevTasks, draft => {
              const index = findIndex({id: taskId}, prevTasks)

              draft[index] = newTask
            })
          )
        }
      }

      return {prevTask}
    },
    onError(_, taskId, context: any) {
      if (context?.prevTask) {
        queryClient.setQueryData(['task', taskId], context.prevTask)
      }
    }
  })
}

export function useToggleImportantMutation(tasksQueryKey: string) {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.toggleImportant, {
    onMutate(taskId) {
      const prevTask = queryClient.getQueryData<TaskT>(['task', taskId])
      const prevTasks = queryClient.getQueryData<TaskT[]>(tasksQueryKey)

      if (prevTask) {
        const newTask = {
          ...prevTask,
          is_important: !prevTask.is_important
        }

        queryClient.setQueryData(['task', taskId], newTask)

        if (prevTasks) {
          queryClient.setQueryData(
            tasksQueryKey,
            produce(prevTasks, draft => {
              const index = findIndex({id: taskId}, prevTasks)

              draft[index] = newTask
            })
          )
        }
      }

      return {prevTask}
    },
    onError(_, taskId, context: any) {
      if (context?.prevTask) {
        queryClient.setQueryData(['task', taskId], context.prevTask)
      }
    }
  })
}

export function useRemoveTaskMutation(tasksQueryKey: string) {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.delete, {
    onSuccess(_, taskId) {
      queryClient.removeQueries(['task', taskId])

      const prevTasks = queryClient.getQueryData<TaskT[]>(tasksQueryKey)

      if (prevTasks) {
        queryClient.setQueryData(
          tasksQueryKey,
          produce(prevTasks, draft => {
            const index = findIndex({id: taskId}, prevTasks)
            draft.splice(index, 1)
          })
        )
      }
    }
  })
}
