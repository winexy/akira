import produce from 'immer'
import findIndex from 'lodash/fp/findIndex'
import {useMutation, useQuery, useQueryClient} from 'react-query'
import {akira} from '@lib/akira'
import {TaskPatchT, TaskT, TaskIdT} from '@store/tasks/types'
import {TaskQueryKeyEnum} from '@modules/tasks/config'

export function useTasksQuery() {
  const queryClient = useQueryClient()

  return useQuery(TaskQueryKeyEnum.All, () => akira.tasks.query(), {
    onSuccess(tasks) {
      tasks.forEach(task => queryClient.setQueryData(['task', task.id], task))
    }
  })
}

export function usePatchTaskMutation(taskId: TaskIdT) {
  const queryClient = useQueryClient()

  return useMutation(
    (patch: TaskPatchT) => {
      return akira.tasks.patch(taskId, patch)
    },
    {
      onSuccess(task) {
        queryClient.setQueryData(['task', taskId], task)
      }
    }
  )
}

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

export function useAddTodoMutation(taskId: TaskIdT) {
  const queryClient = useQueryClient()

  return useMutation(
    (todoTitle: string) => {
      return akira.checklist.addTodo({
        taskId,
        title: todoTitle
      })
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['task', taskId])
      }
    }
  )
}
