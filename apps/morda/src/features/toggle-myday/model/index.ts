import {useMutation, useQueryClient} from 'react-query'
import {akira} from 'shared/api'
import {taskConfig} from 'entities/task'

export function useAddToMyDayMutation() {
  const queryClient = useQueryClient()
  return useMutation(akira.myday.add, {
    onSuccess(_, taskId) {
      queryClient.invalidateQueries(taskConfig.queryKey.MyDay())
      queryClient.invalidateQueries(taskConfig.queryKey.One(taskId))
      queryClient.invalidateQueries(taskConfig.queryKey.Week())
    },
  })
}

export function useRemoveFromMyDayMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.myday.remove, {
    onSuccess(_, taskId) {
      queryClient.invalidateQueries(taskConfig.queryKey.MyDay())
      queryClient.invalidateQueries(taskConfig.queryKey.One(taskId))
      queryClient.invalidateQueries(taskConfig.queryKey.Week())
    },
  })
}
