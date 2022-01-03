import filter from 'lodash/fp/filter'
import {useMutation, useQuery, useQueryClient} from 'react-query'
import {akira} from 'shared/api/akira'
import {TaskPatch, ApiTask, TaskId} from 'modules/tasks/types.d'
import {TaskTag} from 'modules/tags/types.d'
import {TaskQuery} from 'modules/tasks/config'
import {TaskCacheUtils} from 'entities/task'

export function useTasksQuery() {
  const queryClient = useQueryClient()

  return useQuery(TaskQuery.All(), () => akira.tasks.findAll(), {
    onSuccess(tasks) {
      TaskCacheUtils.writeTasksToCache(queryClient, tasks)
    }
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
        queryClient.setQueryData(TaskQuery.One(taskId), task)
        TaskCacheUtils.writeTaskListCache(TaskQuery.MyDay(), queryClient, task)
      }
    }
  )
}

export function useToggleCompletedMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.toggleCompletness, {
    onMutate(taskId) {
      const [prevTask, newTask] = TaskCacheUtils.writeTaskCache(
        taskId,
        queryClient,
        draft => {
          draft.is_completed = !draft.is_completed
        }
      )

      const prevTasksRecord = TaskCacheUtils.writeTaskListsCache(
        queryClient,
        newTask
      )

      return {prevTask, prevTasksRecord}
    },
    onError(_, taskId, context: any) {
      TaskCacheUtils.rollbackTaskMutation(taskId, queryClient, context.prevTask)
      TaskCacheUtils.rollbackTaskListMutations(
        queryClient,
        context.prevTasksRecord
      )
    }
  })
}

export function useToggleImportantMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.toggleImportance, {
    onMutate(taskId) {
      const [prevTask, newTask] = TaskCacheUtils.writeTaskCache(
        taskId,
        queryClient,
        draft => {
          draft.is_important = !draft.is_important
        }
      )

      const prevTasksRecord = TaskCacheUtils.writeTaskListsCache(
        queryClient,
        newTask
      )

      return {prevTask, prevTasksRecord}
    },
    onError(_, taskId, context: any) {
      TaskCacheUtils.rollbackTaskMutation(taskId, queryClient, context.prevTask)
      TaskCacheUtils.rollbackTaskListMutations(
        queryClient,
        context.prevTasksRecord
      )
    }
  })
}

export function useRemoveTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.delete, {
    mutationKey: 'delete-task',
    onSuccess(_, taskId) {
      queryClient.removeQueries(TaskQuery.One(taskId))
      TaskCacheUtils.removeTasksFromCache(
        queryClient,
        TaskQuery.MyDay(),
        taskId
      )
      TaskCacheUtils.removeTasksFromCache(queryClient, TaskQuery.All(), taskId)
    }
  })
}

export function useAddTaskTagMutation(task: ApiTask) {
  const queryClient = useQueryClient()

  return useMutation(
    (tag: TaskTag) => {
      return akira.tasks.addTag(task.id, tag.id)
    },
    {
      onMutate(tag) {
        const [prevTask, newTask] = TaskCacheUtils.writeTaskCache(
          task.id,
          queryClient,
          draft => {
            draft.tags.push(tag)
          }
        )

        const prevTasksRecord = TaskCacheUtils.writeTaskListsCache(
          queryClient,
          newTask
        )

        return {prevTask, prevTasksRecord}
      },
      onError(_, __, context: any) {
        TaskCacheUtils.rollbackTaskMutation(
          task.id,
          queryClient,
          context.prevTask
        )
        TaskCacheUtils.rollbackTaskListMutations(
          queryClient,
          context.prevTasksRecord
        )
      }
    }
  )
}

export function useRemoveTaskTagMutation(task: ApiTask) {
  const queryClient = useQueryClient()

  return useMutation(
    (tag: TaskTag) => {
      return akira.tasks.removeTag(task.id, tag.id)
    },
    {
      onMutate(tag) {
        const [prevTask, newTask] = TaskCacheUtils.writeTaskCache(
          task.id,
          queryClient,
          draft => {
            draft.tags = filter(t => t.id !== tag.id, task.tags)
          }
        )

        const prevTasksRecord = TaskCacheUtils.writeTaskListsCache(
          queryClient,
          newTask
        )

        return {prevTask, prevTasksRecord}
      },
      onError(_, __, context: any) {
        TaskCacheUtils.rollbackTaskMutation(
          task.id,
          queryClient,
          context.prevTask
        )
        TaskCacheUtils.rollbackTaskListMutations(
          queryClient,
          context.prevTasksRecord
        )
      }
    }
  )
}

export function useTaskQuery<Select = ApiTask>(
  taskId: string,
  {
    suspense,
    select
  }: Partial<{
    select(task: ApiTask): Select
    suspense: boolean
  }> = {}
) {
  return useQuery(TaskQuery.One(taskId), () => akira.tasks.findOne(taskId), {
    suspense,
    select
  })
}

export function useMyDayQuery() {
  const queryClient = useQueryClient()

  return useQuery(TaskQuery.MyDay(), () => akira.myday.tasks(), {
    onSuccess(tasks) {
      TaskCacheUtils.writeTasksToCache(queryClient, tasks)
    }
  })
}

export function useWeekQuery() {
  const queryClient = useQueryClient()

  return useQuery<Array<ApiTask>>(TaskQuery.Week(), () => akira.tasks.week(), {
    onSuccess(tasks) {
      TaskCacheUtils.writeTasksToCache(queryClient, tasks)
    }
  })
}
