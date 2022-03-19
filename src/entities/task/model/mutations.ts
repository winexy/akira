import {TaskId, TaskPatch} from 'modules/tasks/types.d'
import {useMutation, useQueryClient} from 'react-query'
import {akira} from 'shared/api'
import {taskConfig} from '../config'
import {TaskCacheUtils} from '../lib'

export function useToggleCompletedMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.toggleCompletness, {
    onMutate(taskId) {
      return TaskCacheUtils.writeOptimisticUpdate(
        taskId,
        queryClient,
        draft => {
          draft.is_completed = !draft.is_completed
        },
      )
    },
    onError(_, taskId, context: any) {
      TaskCacheUtils.rollbackOptimisticUpdate(taskId, queryClient, context)
    },
  })
}

export function useToggleImportantMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.toggleImportance, {
    onMutate(taskId) {
      return TaskCacheUtils.writeOptimisticUpdate(
        taskId,
        queryClient,
        draft => {
          draft.is_important = !draft.is_important
        },
      )
    },
    onError(_, taskId, context: any) {
      TaskCacheUtils.rollbackOptimisticUpdate(taskId, queryClient, context)
    },
  })
}

export function useRemoveTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.delete, {
    mutationKey: 'delete-task',
    onSuccess(_, taskId) {
      queryClient.removeQueries(taskConfig.queryKey.One(taskId))
      TaskCacheUtils.removeTasksFromCache(
        queryClient,
        taskConfig.queryKey.MyDay(),
        taskId,
      )
      TaskCacheUtils.removeTasksFromCache(
        queryClient,
        taskConfig.queryKey.All(),
        taskId,
      )
    },
  })
}

export function usePatchTaskMutation(taskId: TaskId) {
  const queryClient = useQueryClient()

  return useMutation(
    (patch: TaskPatch) => {
      return akira.tasks.patch(taskId, patch)
    },
    {
      onSuccess(task) {
        queryClient.setQueryData(taskConfig.queryKey.One(taskId), task)
        TaskCacheUtils.writeTaskListCache(
          taskConfig.queryKey.MyDay(),
          queryClient,
          task,
        )
      },
    },
  )
}
