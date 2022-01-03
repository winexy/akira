import produce, {Draft, Immutable} from 'immer'
import findIndex from 'lodash/fp/findIndex'
import isUndefined from 'lodash/fp/isUndefined'
import isNull from 'lodash/fp/isNull'
import reduce from 'lodash/reduce'
import {QueryClient} from 'react-query'
import {ApiTask, TaskId} from 'modules/tasks/types.d'
import {TaskQuery} from 'modules/tasks/config'
import {forEach} from 'lodash/fp'

type PrevTasksEntries = Array<[Array<string>, Array<ApiTask> | null]>

export type MutationContext = {
  prevTask: ApiTask | null
  prevTasksRecord: PrevTasksEntries
}

type DraftMutation = (
  draft: Draft<ApiTask>,
  prevTask: Immutable<ApiTask>
) => void

export function writeOptimisticUpdate(
  taskId: TaskId,
  queryClient: QueryClient,
  mutateDraft: DraftMutation
): MutationContext {
  const [prevTask, newTask] = writeTaskCache(taskId, queryClient, mutateDraft)
  const prevTasksRecord = writeTaskListsCache(queryClient, newTask)

  return {prevTask, prevTasksRecord}
}

export function rollbackOptimisticUpdate(
  taskId: TaskId,
  queryClient: QueryClient,
  context: MutationContext
) {
  rollbackTaskMutation(taskId, queryClient, context.prevTask)
  rollbackTaskListMutations(queryClient, context.prevTasksRecord)
}

export function writeTaskCache(
  taskId: TaskId,
  queryClient: QueryClient,
  mutateDraft: DraftMutation
): [null, null] | [ApiTask, ApiTask] {
  const prevTask = queryClient.getQueryData<ApiTask>(TaskQuery.One(taskId))

  if (!isUndefined(prevTask)) {
    const newTask = produce(prevTask, draft => mutateDraft(draft, prevTask))
    queryClient.setQueriesData(TaskQuery.One(taskId), newTask)
    return [prevTask, newTask]
  }

  return [null, null]
}

export function writeTaskListCache(
  tasksQueryKey: Array<string>,
  queryClient: QueryClient,
  updatedTask: ApiTask | null
): ApiTask[] | null {
  const prevTasks = queryClient.getQueryData<ApiTask[]>(tasksQueryKey)

  if (isUndefined(prevTasks) || isNull(updatedTask)) {
    return null
  }

  queryClient.setQueryData(
    tasksQueryKey,
    produce(prevTasks, draft => {
      const index = findIndex({id: updatedTask.id}, prevTasks)

      if (index !== -1) {
        draft[index] = updatedTask
      }
    })
  )

  return prevTasks
}

export function writeTaskListsCache(
  queryClient: QueryClient,
  updatedTask: ApiTask | null
) {
  const keys = [TaskQuery.All(), TaskQuery.MyDay(), TaskQuery.Week()]

  return reduce(
    keys,
    (entries, queryKey) => {
      entries.push([
        queryKey,
        writeTaskListCache(queryKey, queryClient, updatedTask)
      ])

      return entries
    },
    [] as PrevTasksEntries
  )
}

export function rollbackTaskListMutations(
  queryClient: QueryClient,
  prevTasksEntries: PrevTasksEntries
) {
  forEach(([queryKey, tasks]) => {
    rollbackTaskListMutation(queryKey, queryClient, tasks)
  }, prevTasksEntries)
}

export function rollbackTaskMutation(
  taskId: TaskId,
  queryClient: QueryClient,
  prevTask: ApiTask | null
) {
  if (prevTask) {
    queryClient.setQueryData(TaskQuery.One(taskId), prevTask)
  }
}

export function rollbackTaskListMutation(
  tasksQueryKey: Array<string>,
  queryClient: QueryClient,
  prevTasks: ApiTask[] | null
) {
  if (prevTasks) {
    queryClient.setQueryData(tasksQueryKey, prevTasks)
  }
}

export function writeTasksToCache(
  queryClient: QueryClient,
  tasks: Array<ApiTask>
) {
  tasks.forEach(task => queryClient.setQueryData(TaskQuery.One(task.id), task))
}

export function removeTask(tasks: ApiTask[], taskId: TaskId) {
  return produce(tasks, draft => {
    const index = findIndex({id: taskId}, tasks)

    if (index !== -1) {
      draft.splice(index, 1)
    }
  })
}

export function removeTasksFromCache(
  queryClient: QueryClient,
  queryKey: Array<string>,
  taskId: TaskId
) {
  const tasks = queryClient.getQueryData<ApiTask[]>(queryKey)

  if (tasks) {
    queryClient.setQueryData(queryKey, removeTask(tasks, taskId))
  }
}
