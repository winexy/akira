import {useMutation, useQueryClient} from 'react-query'
import uniqueId from 'lodash/fp/uniqueId'
import {TaskId, Todo, TodoId, TodoPatch} from 'modules/tasks/types.d'
import {akira} from 'shared/api'
import filter from 'lodash/fp/filter'
import findIndex from 'lodash/fp/findIndex'
import {taskConfig, TaskCacheUtils} from 'entities/task'

export function useAddTodoMutation(taskId: TaskId) {
  const queryClient = useQueryClient()

  return useMutation(
    (todoTitle: string) => {
      return akira.checklist.addTodo({
        taskId,
        title: todoTitle,
      })
    },
    {
      onMutate(todoTitle) {
        const todo: Todo = {
          id: uniqueId(todoTitle),
          title: todoTitle,
          is_completed: false,
          task_id: taskId,
        }

        return TaskCacheUtils.writeOptimisticUpdate(
          taskId,
          queryClient,
          draft => {
            draft.checklist.push(todo)
          },
        )
      },
      onSuccess() {
        queryClient.invalidateQueries(taskConfig.queryKey.One(taskId))
      },
      onError(_, __, context: any) {
        TaskCacheUtils.rollbackOptimisticUpdate(taskId, queryClient, context)
      },
    },
  )
}

export function useBatchAddTodoMutation(taskId: TaskId) {
  const queryClient = useQueryClient()

  return useMutation(
    async (todos: Array<string>) => {
      // eslint-disable-next-line no-restricted-syntax
      for await (const title of todos) {
        await akira.checklist.addTodo({taskId, title})
      }
    },
    {
      onMutate(todos) {
        const optimisticTodos = todos.map(
          (todo): Todo => ({
            id: uniqueId(todo),
            title: todo,
            is_completed: false,
            task_id: taskId,
          }),
        )

        return TaskCacheUtils.writeOptimisticUpdate(
          taskId,
          queryClient,
          draft => {
            optimisticTodos.forEach(todo => {
              draft.checklist.push(todo)
            })
          },
        )
      },
      onSuccess() {
        queryClient.invalidateQueries(taskConfig.queryKey.One(taskId))
      },
      onError(_, __, context: any) {
        TaskCacheUtils.rollbackOptimisticUpdate(taskId, queryClient, context)
      },
    },
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
        return TaskCacheUtils.writeOptimisticUpdate(
          taskId,
          queryClient,
          (draft, prevTask) => {
            const index = findIndex({id: todoId}, prevTask.checklist)

            if (index !== -1) {
              Object.assign(draft.checklist[index], patch)
            }
          },
        )
      },
      onError(_, __, context: any) {
        TaskCacheUtils.rollbackOptimisticUpdate(taskId, queryClient, context)
      },
    },
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
        return TaskCacheUtils.writeOptimisticUpdate(
          taskId,
          queryClient,
          draft => {
            draft.checklist = filter(
              todo => todo.id !== todoId,
              draft.checklist,
            )
          },
        )
      },
      onError(_, __, context: any) {
        return TaskCacheUtils.rollbackOptimisticUpdate(
          taskId,
          queryClient,
          context,
        )
      },
    },
  )
}
