import {useMutation, useQueryClient} from 'react-query'
import uniqueId from 'lodash/fp/uniqueId'
import {TaskId, Todo, TodoId, TodoPatch} from 'modules/tasks/types.d'
import {akira} from 'shared/api'
import {TaskQuery} from 'modules/tasks/config'
import {
  rollbackTaskListMutations,
  rollbackTaskMutation,
  writeTaskCache,
  writeTaskListsCache
} from 'modules/tasks/hooks'
import filter from 'lodash/fp/filter'
import findIndex from 'lodash/fp/findIndex'

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
        const [prevTask, newTask] = writeTaskCache(
          taskId,
          queryClient,
          (draft, prevTask) => {
            const index = findIndex({id: todoId}, prevTask.checklist)

            if (index !== -1) {
              Object.assign(draft.checklist[index], patch)
            }
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
