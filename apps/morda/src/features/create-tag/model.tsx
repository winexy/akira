import {useMutation, useQueryClient} from 'react-query'
import {taskTagModel} from 'entities/task-tag'
import {akira} from 'shared/api'

export function useCreateTagMutation() {
  const queryClient = useQueryClient()

  return useMutation<taskTagModel.TaskTag, Error, string>(akira.tags.create, {
    onSuccess() {
      queryClient.invalidateQueries(['tags'])
    },
  })
}
