import produce, {Draft, Immutable} from 'immer'
import findIndex from 'lodash/fp/findIndex'
import filter from 'lodash/fp/filter'
import uniqueId from 'lodash/fp/uniqueId'
import isUndefined from 'lodash/fp/isUndefined'
import isNull from 'lodash/fp/isNull'
import forOwn from 'lodash/forOwn'
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
import {TaskQueryKeyEnum, TaskQuery} from '@modules/tasks/config'

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
  tasksQueryKey: TaskQueryKeyEnum,
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
  reduce(
    TaskQueryKeyEnum,
    (acc, queryKey) => {
      acc[queryKey] = writeTaskListCache(queryKey, queryClient, updatedTask)
      return acc
    },
    {} as PrevTasksRecord
  )
}

type PrevTasksRecord = Record<TaskQueryKeyEnum, Array<ApiTask> | null>

function rollbackTaskListMutations(
  queryClient: QueryClient,
  prevTasksRecord: PrevTasksRecord
) {
  forOwn(TaskQueryKeyEnum, queryKey => {
    rollbackTaskListMutation(queryKey, queryClient, prevTasksRecord[queryKey])
  })
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
  tasksQueryKey: TaskQueryKeyEnum,
  queryClient: QueryClient,
  prevTasks: ApiTask[] | null
) {
  if (prevTasks) {
    queryClient.setQueryData(tasksQueryKey, prevTasks)
  }
}

export function useTasksQuery() {
  const queryClient = useQueryClient()

  return useQuery(TaskQueryKeyEnum.All, () => akira.tasks.findAll(), {
    onSuccess(tasks) {
      tasks.forEach(task =>
        queryClient.setQueryData(TaskQuery.One(task.id), task)
      )
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
        writeTaskListCache(TaskQueryKeyEnum.MyDay, queryClient, task)
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
  queryKey: TaskQueryKeyEnum,
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
      removeTasksFromCache(queryClient, TaskQueryKeyEnum.MyDay, taskId)
      removeTasksFromCache(queryClient, TaskQueryKeyEnum.All, taskId)
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
