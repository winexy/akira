import {ApiTask} from 'modules/tasks/types.d'
import {useQuery, useQueryClient} from 'react-query'
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
  return useQuery(
    taskConfig.queryKey.One(taskId),
    () => akira.tasks.findOne(taskId),
    {
      suspense,
      select,
    },
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
