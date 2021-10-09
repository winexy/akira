import {useMutation, useQueryClient} from 'react-query'
import {api} from 'shared/api'
import {TaskId} from 'modules/tasks/types.d'
import {TaskQuery} from 'modules/tasks/config'

export function useScheduleTaskMutation(taskId: TaskId) {
  const queryClient = useQueryClient()

  return useMutation(
    (date: string) =>
      api.post(`task-scheduler/schedule`, {
        task_id: taskId,
        date
      }),
    {
      onSuccess() {
        queryClient.refetchQueries(TaskQuery.One(taskId))
        queryClient.invalidateQueries(TaskQuery.MyDay())
        queryClient.invalidateQueries(TaskQuery.Week())
      }
    }
  )
}
