import {ApiTask} from 'modules/tasks/types.d'
import {useQuery, useQueryClient, UseQueryOptions} from 'react-query'
import {akira} from 'shared/api'
import {TaskCacheUtils} from '../lib'
import {taskConfig} from '../config'

export function useTasksQuery() {
  const queryClient = useQueryClient()

  return useQuery(taskConfig.queryKey.All(), () => akira.tasks.findAll(), {
    onSuccess(tasks) {
      TaskCacheUtils.writeTasksToCache(queryClient, tasks)
    },
  })
}

export function useTaskQuery<Params = UseQueryOptions>(
  taskId: string,
  params: Partial<Params> = {},
) {
  return useQuery(
    taskConfig.queryKey.One(taskId),
    () => akira.tasks.findOne(taskId),
    params,
  )
}

export function useMyDayQuery() {
  const queryClient = useQueryClient()

  return useQuery(taskConfig.queryKey.MyDay(), () => akira.myday.tasks(), {
    onSuccess(tasks) {
      TaskCacheUtils.writeTasksToCache(queryClient, tasks)
    },
  })
}

export function useWeekQuery() {
  const queryClient = useQueryClient()

  return useQuery<Array<ApiTask>>(
    taskConfig.queryKey.Week(),
    () => akira.tasks.week(),
    {
      onSuccess(tasks) {
        TaskCacheUtils.writeTasksToCache(queryClient, tasks)
      },
    },
  )
}

export function useTasksListQuery(listId: string) {
  const queryClient = useQueryClient()

  return useQuery(
    taskConfig.queryKey.List(listId),
    () => akira.lists.findTasks(Number(listId)),
    {
      onSuccess(data) {
        TaskCacheUtils.writeTasksToCache(queryClient, data.tasks)
      },
    },
  )
}
