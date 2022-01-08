import {useMutation, useQueryClient} from 'react-query'
import {TaskQuery} from 'modules/tasks/config'
import {TaskId} from 'modules/tasks/types.d'
import {akira} from 'shared/api'

export function useCloneTaskMutation(taskId: TaskId) {
  const queryClient = useQueryClient()

  return useMutation(
    () => {
      return akira.tasks.clone(taskId)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(TaskQuery.MyDay())
      }
    }
  )
}
