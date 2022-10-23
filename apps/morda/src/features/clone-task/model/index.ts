import {useMutation, useQueryClient} from 'react-query'
import {TaskId} from 'modules/tasks/types.d'
import {akira} from 'shared/api'
import {taskConfig} from 'entities/task'

export function useCloneTaskMutation(taskId: TaskId) {
  const queryClient = useQueryClient()

  return useMutation(
    () => {
      return akira.tasks.clone(taskId)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(taskConfig.queryKey.MyDay())
      },
    },
  )
}
