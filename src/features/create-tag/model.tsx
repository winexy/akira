import {useMutation, useQueryClient} from 'react-query'
import {TaskTag} from 'modules/tags/types.d'
import {akira} from 'shared/api'

export function useCreateTagMutation() {
  const queryClient = useQueryClient()

  return useMutation<TaskTag, Error, string>(akira.tags.create, {
    onSuccess() {
      queryClient.invalidateQueries(['tags'])
    },
  })
}
