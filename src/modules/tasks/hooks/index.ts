import produce, {Draft, Immutable} from 'immer'
import findIndex from 'lodash/fp/findIndex'
import filter from 'lodash/fp/filter'
import uniqueId from 'lodash/fp/uniqueId'
import isUndefined from 'lodash/fp/isUndefined'
import isNull from 'lodash/fp/isNull'
import reduce from 'lodash/reduce'
import {useMutation, useQuery, useQueryClient, QueryClient} from 'react-query'
import {akira} from '@lib/akira'
import {
  TaskPatch,
  ApiTask,
  TaskId,
  TodoId,
  TodoPatch,
  Todo
} from '@modules/tasks/types.d'
import {TaskTag} from '@modules/tags/types.d'
import {TaskQuery} from '@modules/tasks/config'
import {forEach} from 'lodash/fp'

function writeTaskCache(
  taskId: TaskId,
  queryClient: QueryClient,
  mutateDraft: (draft: Draft<ApiTask>, prevTask: Immutable<ApiTask>) => void
): [null, null] | [ApiTask, ApiTask] {
  const prevTask = queryClient.getQueryData<ApiTask>(TaskQuery.One(taskId))

  if (!isUndefined(prevTask)) {
    const newTask = produce(prevTask, draft => mutateDraft(draft, prevTask))
    queryClient.setQueriesData(TaskQuery.One(taskId), newTask)
    return [prevTask, newTask]
  }

  return [null, null]
}

function writeTaskListCache(
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

function writeTaskListsCache(
  queryClient: QueryClient,
  updatedTask: ApiTask | null
) {
  const keys = [TaskQuery.All(), TaskQuery.MyDay(), TaskQuery.Week()]

  reduce(
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

type PrevTasksEntries = Array<[Array<string>, Array<ApiTask> | null]>

function rollbackTaskListMutations(
  queryClient: QueryClient,
  prevTasksEntries: PrevTasksEntries
) {
  forEach(([queryKey, tasks]) => {
    rollbackTaskListMutation(queryKey, queryClient, tasks)
  }, prevTasksEntries)
}

function rollbackTaskMutation(
  taskId: TaskId,
  queryClient: QueryClient,
  prevTask: ApiTask | undefined
) {
  if (prevTask) {
    queryClient.setQueryData(TaskQuery.One(taskId), prevTask)
  }
}

function rollbackTaskListMutation(
  tasksQueryKey: Array<string>,
  queryClient: QueryClient,
  prevTasks: ApiTask[] | null
) {
  if (prevTasks) {
    queryClient.setQueryData(tasksQueryKey, prevTasks)
  }
}

function writeTasksToCache(
  queryClient: QueryClient,
  tasks: Array<ApiTask>
): void {
  tasks.forEach(task => queryClient.setQueryData(TaskQuery.One(task.id), task))
}

export function useTasksQuery() {
  const queryClient = useQueryClient()

  return useQuery(TaskQuery.All(), () => akira.tasks.findAll(), {
    onSuccess(tasks) {
      writeTasksToCache(queryClient, tasks)
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
        writeTaskListCache(TaskQuery.MyDay(), queryClient, task)
      }
    }
  )
}

export function useToggleCompletedMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.toggleCompletness, {
    onMutate(taskId) {
      const [prevTask, newTask] = writeTaskCache(taskId, queryClient, draft => {
        draft.is_completed = !draft.is_completed
      })

      const prevTasksRecord = writeTaskListsCache(queryClient, newTask)

      return {prevTask, prevTasksRecord}
    },
    onError(_, taskId, context: any) {
      rollbackTaskMutation(taskId, queryClient, context.prevTask)
      rollbackTaskListMutations(queryClient, context.prevTasksRecord)
    }
  })
}

export function useToggleImportantMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.toggleImportance, {
    onMutate(taskId) {
      const [prevTask, newTask] = writeTaskCache(taskId, queryClient, draft => {
        draft.is_important = !draft.is_important
      })

      const prevTasksRecord = writeTaskListsCache(queryClient, newTask)

      return {prevTask, prevTasksRecord}
    },
    onError(_, taskId, context: any) {
      rollbackTaskMutation(taskId, queryClient, context.prevTask)
      rollbackTaskListMutations(queryClient, context.prevTasksRecord)
    }
  })
}

function removeTask(tasks: ApiTask[], taskId: TaskId) {
  return produce(tasks, draft => {
    const index = findIndex({id: taskId}, tasks)

    if (index !== -1) {
      draft.splice(index, 1)
    }
  })
}

function removeTasksFromCache(
  queryClient: QueryClient,
  queryKey: Array<string>,
  taskId: TaskId
) {
  const tasks = queryClient.getQueryData<ApiTask[]>(queryKey)

  if (tasks) {
    queryClient.setQueryData(queryKey, removeTask(tasks, taskId))
  }
}

export function useRemoveTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.delete, {
    mutationKey: 'delete-task',
    onSuccess(_, taskId) {
      queryClient.removeQueries(TaskQuery.One(taskId))
      removeTasksFromCache(queryClient, TaskQuery.MyDay(), taskId)
      removeTasksFromCache(queryClient, TaskQuery.All(), taskId)
    }
  })
}

export function useAddTodoMutation(taskId: TaskId) {
  const queryClient = useQueryClient()

  return useMutation(
    (Todoitle: string) => {
      return akira.checklist.addTodo({
        taskId,
        title: Todoitle
      })
    },
    {
      onMutate(Todoitle) {
        const todo: Todo = {
          id: uniqueId(Todoitle),
          title: Todoitle,
          is_completed: false,
          task_id: taskId
        }

        const [prevTask, newTask] = writeTaskCache(
          taskId,
          queryClient,
          draft => {
            draft.checklist.push(todo)
          }
        )

        const prevTasksRecord = writeTaskListsCache(queryClient, newTask)

        return {prevTask, prevTasksRecord}
      },
      onSuccess() {
        queryClient.invalidateQueries(TaskQuery.One(taskId))
      },
      onError(_, __, context: any) {
        rollbackTaskMutation(taskId, queryClient, context.prevTask)
        rollbackTaskListMutations(queryClient, context.prevTasksRecord)
      }
    }
  )
}

export function usePatchTodoMutation(taskId: TaskId) {
  const queryClient = useQueryClient()

  return useMutation(
    ({todoId, patch}: {todoId: TodoId; patch: TodoPatch}) => {
      return akira.checklist.patchTodo(taskId, todoId, patch)
    },
    {
      onMutate({todoId, patch}) {
        const [prevTask] = writeTaskCache(
          taskId,
          queryClient,
          (draft, prevTask) => {
            const index = findIndex({id: todoId}, prevTask.checklist)

            if (index !== -1) {
              draft.checklist[index] = {
                ...prevTask.checklist[index],
                ...patch
              }
            }
          }
        )

        return {prevTask}
      },
      onError(_, __, context: any) {
        rollbackTaskMutation(taskId, queryClient, context.prevTask)
      }
    }
  )
}

export function useRemoveTodoMutation(taskId: TaskId) {
  const queryClient = useQueryClient()

  return useMutation(
    (todoId: TodoId) => {
      return akira.checklist.removeTodo(taskId, todoId)
    },
    {
      onMutate(todoId) {
        const [prevTask, newTask] = writeTaskCache(
          taskId,
          queryClient,
          draft => {
            draft.checklist = filter(
              todo => todo.id !== todoId,
              draft.checklist
            )
          }
        )

        const prevTasksRecord = writeTaskListsCache(queryClient, newTask)

        return {prevTask, prevTasksRecord}
      },
      onError(_, __, context: any) {
        rollbackTaskMutation(taskId, queryClient, context.prevTask)
        rollbackTaskListMutations(queryClient, context.prevTasksRecord)
      }
    }
  )
}

export function useAddTaskTagMutation(task: ApiTask) {
  const queryClient = useQueryClient()

  return useMutation(
    (tag: TaskTag) => {
      return akira.tasks.addTag(task.id, tag.id)
    },
    {
      onMutate(tag) {
        const [prevTask, newTask] = writeTaskCache(
          task.id,
          queryClient,
          draft => {
            draft.tags.push(tag)
          }
        )

        const prevTasksRecord = writeTaskListsCache(queryClient, newTask)

        return {prevTask, prevTasksRecord}
      },
      onError(_, __, context: any) {
        rollbackTaskMutation(task.id, queryClient, context.prevTask)
        rollbackTaskListMutations(queryClient, context.prevTasksRecord)
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
        const [prevTask, newTask] = writeTaskCache(
          task.id,
          queryClient,
          draft => {
            draft.tags = filter(t => t.id !== tag.id, task.tags)
          }
        )

        const prevTasksRecord = writeTaskListsCache(queryClient, newTask)

        return {prevTask, prevTasksRecord}
      },
      onError(_, __, context: any) {
        rollbackTaskMutation(task.id, queryClient, context.prevTask)
        rollbackTaskListMutations(queryClient, context.prevTasksRecord)
      }
    }
  )
}

export function useTaskQuery<Select = ApiTask>(
  taskId: string,
  {select}: {select?(task: ApiTask): Select} = {}
) {
  return useQuery(TaskQuery.One(taskId), () => akira.tasks.findOne(taskId), {
    select
  })
}

export function useMyDayQuery() {
  const queryClient = useQueryClient()

  return useQuery(TaskQuery.MyDay(), akira.myday.tasks, {
    onSuccess(tasks) {
      writeTasksToCache(queryClient, tasks)
    }
  })
}

export function useWeekQuery() {
  const queryClient = useQueryClient()

  return useQuery<Array<ApiTask>>(TaskQuery.Week(), () => akira.tasks.week(), {
    onSuccess(tasks) {
      writeTasksToCache(queryClient, tasks)
    }
  })
}
