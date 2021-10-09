import {useMutation, useQueryClient} from 'react-query'
import {TaskQuery} from 'modules/tasks/config'
import {akira} from 'shared/api'

export function useAddToMyDayMutation() {
  const queryClient = useQueryClient()
  return useMutation(akira.myday.add, {
    onSuccess(_, taskId) {
      queryClient.invalidateQueries(TaskQuery.MyDay())
      queryClient.invalidateQueries(TaskQuery.One(taskId))
      queryClient.invalidateQueries(TaskQuery.Week())
    }
  })
}

export function useRemoveFromMyDayMutation() {
  const queryClient = useQueryClient()

  return useMutation(akira.myday.remove, {
    onSuccess(_, taskId) {
      queryClient.invalidateQueries(TaskQuery.MyDay())
      queryClient.invalidateQueries(TaskQuery.One(taskId))
      queryClient.invalidateQueries(TaskQuery.Week())
    }
  })
}
