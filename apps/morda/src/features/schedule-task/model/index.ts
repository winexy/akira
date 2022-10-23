import {useMutation, useQueryClient} from 'react-query'
import {api} from 'shared/api'
import {TaskId} from 'modules/tasks/types.d'
import {taskConfig} from 'entities/task'

export function useScheduleTaskMutation(taskId: TaskId) {
  const queryClient = useQueryClient()

  return useMutation(
    (date: string) =>
      api.post(`task-scheduler/schedule`, {
        task_id: taskId,
        date,
      }),
    {
      onSuccess() {
        queryClient.refetchQueries(taskConfig.queryKey.One(taskId))
        queryClient.invalidateQueries(taskConfig.queryKey.MyDay())
        queryClient.invalidateQueries(taskConfig.queryKey.Week())
      },
    },
  )
}
