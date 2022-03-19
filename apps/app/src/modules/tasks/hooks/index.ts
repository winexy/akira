import filter from 'lodash/fp/filter'
import {useMutation, useQueryClient} from 'react-query'
import {akira} from 'shared/api/akira'
import {ApiTask} from 'modules/tasks/types.d'
import {taskTagModel} from 'entities/task-tag'
import {TaskCacheUtils, taskModel} from 'entities/task'

export const {
  useTaskQuery,
  useTasksQuery,
  useMyDayQuery,
  useWeekQuery,
  useTasksListQuery,
  usePatchTaskMutation,
  useRemoveTaskMutation,
  useToggleImportantMutation,
  useToggleCompletedMutation,
} = taskModel

export function useAddTaskTagMutation(task: ApiTask) {
  const queryClient = useQueryClient()

  return useMutation(
    (tag: taskTagModel.TaskTag) => {
      return akira.tasks.addTag(task.id, tag.id)
    },
    {
      onMutate(tag) {
        return TaskCacheUtils.writeOptimisticUpdate(
          task.id,
          queryClient,
          draft => {
            draft.tags.push(tag)
          },
        )
      },
      onError(_, __, context: any) {
        TaskCacheUtils.rollbackOptimisticUpdate(task.id, queryClient, context)
      },
    },
  )
}

export function useRemoveTaskTagMutation(task: ApiTask) {
  const queryClient = useQueryClient()

  return useMutation(
    (tag: taskTagModel.TaskTag) => {
      return akira.tasks.removeTag(task.id, tag.id)
    },
    {
      onMutate(tag) {
        return TaskCacheUtils.writeOptimisticUpdate(
          task.id,
          queryClient,
          draft => {
            draft.tags = filter(t => t.id !== tag.id, task.tags)
          },
        )
      },
      onError(_, __, context: any) {
        TaskCacheUtils.rollbackOptimisticUpdate(task.id, queryClient, context)
      },
    },
  )
}
