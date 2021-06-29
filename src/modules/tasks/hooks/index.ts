import produce, {Draft, Immutable} from 'immer'
import findIndex from 'lodash/fp/findIndex'
import filter from 'lodash/fp/filter'
import uniqueId from 'lodash/fp/uniqueId'
import isUndefined from 'lodash/fp/isUndefined'
import isNull from 'lodash/fp/isNull'
import {useMutation, useQuery, useQueryClient, QueryClient} from 'react-query'
import {akira} from '@lib/akira'
import {
  TaskPatchT,
  TaskT,
  TaskIdT,
  TodoIdT,
  TodoPatchT,
  TagT,
  TodoT
} from '@store/tasks/types'
import {TaskQueryKeyEnum} from '@modules/tasks/config'

function writeTaskCache(
  taskId: TaskIdT,
  queryClient: QueryClient,
  mutateDraft: (draft: Draft<TaskT>, prevTask: Immutable<TaskT>) => void
): [null, null] | [TaskT, TaskT] {
  const prevTask = queryClient.getQueryData<TaskT>(['task', taskId])

  if (!isUndefined(prevTask)) {
    const newTask = produce(prevTask, draft => mutateDraft(draft, prevTask))
    queryClient.setQueriesData(['task', taskId], newTask)
    return [prevTask, newTask]
  }

  return [null, null]
}

function writeTaskListCache(
  tasksQueryKey: TaskQueryKeyEnum,
  queryClient: QueryClient,
  updatedTask: TaskT | null
): {prevTasks: TaskT[] | null} {
  const prevTasks = queryClient.getQueryData<TaskT[]>(tasksQueryKey)

  if (isUndefined(prevTasks) || isNull(updatedTask)) {
    return {prevTasks: null}
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

  return {prevTasks}
}

function rollbackTaskMutation(
  taskId: TaskIdT,
  queryClient: QueryClient,
  prevTask: TaskT | undefined
) {
  if (prevTask) {
    queryClient.setQueryData(['task', taskId], prevTask)
  }
}

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
        writeTaskListCache(TaskQueryKeyEnum.MyDay, queryClient, task)
      }
    }
  )
}

export function useToggleCompletedMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.toggleCompleted, {
    onMutate(taskId) {
      const [prevTask, newTask] = writeTaskCache(taskId, queryClient, draft => {
        draft.is_completed = !draft.is_completed
      })

      const {prevTasks} = writeTaskListCache(
        TaskQueryKeyEnum.MyDay,
        queryClient,
        newTask
      )

      return {prevTask}
    },
    onError(_, taskId, context: any) {
      rollbackTaskMutation(taskId, queryClient, context.prevTask)
    }
  })
}

export function useToggleImportantMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.toggleImportant, {
    onMutate(taskId) {
      const [prevTask, newTask] = writeTaskCache(taskId, queryClient, draft => {
        draft.is_important = !draft.is_important
      })

      const {prevTasks} = writeTaskListCache(
        TaskQueryKeyEnum.MyDay,
        queryClient,
        newTask
      )

      return {prevTask}
    },
    onError(_, taskId, context: any) {
      rollbackTaskMutation(taskId, queryClient, context.prevTask)
    }
  })
}

export function useRemoveTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.tasks.delete, {
    onSuccess(_, taskId) {
      queryClient.removeQueries(['task', taskId])

      const prevTasks = queryClient.getQueryData<TaskT[]>(
        TaskQueryKeyEnum.MyDay
      )

      if (prevTasks) {
        queryClient.setQueryData(
          TaskQueryKeyEnum.MyDay,
          produce(prevTasks, draft => {
            const index = findIndex({id: taskId}, prevTasks)

            if (index !== -1) {
              draft.splice(index, 1)
            }
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
      onMutate(todoTitle) {
        const todo: TodoT = {
          id: uniqueId(todoTitle),
          title: todoTitle,
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

        const {prevTasks} = writeTaskListCache(
          TaskQueryKeyEnum.MyDay,
          queryClient,
          newTask
        )

        return {prevTask}
      },
      onSuccess() {
        queryClient.invalidateQueries(['task', taskId])
      },
      onError(_, __, context: any) {
        rollbackTaskMutation(taskId, queryClient, context.prevTask)
      }
    }
  )
}

export function usePatchTodoMutation(taskId: TaskIdT) {
  const queryClient = useQueryClient()

  return useMutation(
    ({todoId, patch}: {todoId: TodoIdT; patch: TodoPatchT}) => {
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

export function useRemoveTodoMutation(taskId: TaskIdT) {
  const queryClient = useQueryClient()

  return useMutation(
    (todoId: TodoIdT) => {
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

        const {prevTasks} = writeTaskListCache(
          TaskQueryKeyEnum.MyDay,
          queryClient,
          newTask
        )

        return {prevTask}
      },
      onError(_, __, context: any) {
        rollbackTaskMutation(taskId, queryClient, context.prevTask)
      }
    }
  )
}

export function useAddTaskTagMutation(task: TaskT) {
  const queryClient = useQueryClient()

  return useMutation(
    (tag: TagT) => {
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

        const {prevTasks} = writeTaskListCache(
          TaskQueryKeyEnum.MyDay,
          queryClient,
          newTask
        )

        return {prevTask}
      },
      onError(_, __, context: any) {
        rollbackTaskMutation(task.id, queryClient, context.prevTask)
      }
    }
  )
}

export function useRemoveTaskTagMutation(task: TaskT) {
  const queryClient = useQueryClient()

  return useMutation(
    (tag: TagT) => {
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

        const {prevTasks} = writeTaskListCache(
          TaskQueryKeyEnum.MyDay,
          queryClient,
          newTask
        )

        return {prevTask}
      },
      onError(_, __, context: any) {
        rollbackTaskMutation(task.id, queryClient, context.prevTask)
      }
    }
  )
}
