import {TaskQuery} from 'modules/tasks/config'
import {ApiTask} from 'modules/tasks/types.d'
import {useQuery, useQueryClient} from 'react-query'
import {akira} from 'shared/api'
import {TaskCacheUtils} from '../lib'

export function useTasksQuery() {
  const queryClient = useQueryClient()

  return useQuery(TaskQuery.All(), () => akira.tasks.findAll(), {
    onSuccess(tasks) {
      TaskCacheUtils.writeTasksToCache(queryClient, tasks)
    },
  })
}

export function useTaskQuery<Select = ApiTask>(
  taskId: string,
  {
    suspense,
    select,
  }: Partial<{
    select(task: ApiTask): Select
    suspense: boolean
  }> = {},
) {
  return useQuery(TaskQuery.One(taskId), () => akira.tasks.findOne(taskId), {
    suspense,
    select,
  })
}

export function useMyDayQuery() {
  const queryClient = useQueryClient()

  return useQuery(TaskQuery.MyDay(), () => akira.myday.tasks(), {
    onSuccess(tasks) {
      TaskCacheUtils.writeTasksToCache(queryClient, tasks)
    },
  })
}

export function useWeekQuery() {
  const queryClient = useQueryClient()

  return useQuery<Array<ApiTask>>(TaskQuery.Week(), () => akira.tasks.week(), {
    onSuccess(tasks) {
      TaskCacheUtils.writeTasksToCache(queryClient, tasks)
    },
  })
}

export function useTasksListQuery(listId: string) {
  const queryClient = useQueryClient()

  return useQuery(
    TaskQuery.List(listId),
    () => akira.lists.findTasks(Number(listId)),
    {
      onSuccess(data) {
        TaskCacheUtils.writeTasksToCache(queryClient, data.tasks)
      },
    },
  )
}
