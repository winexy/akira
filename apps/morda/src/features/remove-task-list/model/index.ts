import {useIsMutating, useMutation, useQueryClient} from 'react-query'
import {akira} from 'shared/api'
import {openActionSheet} from 'shared/ui/action-sheet/model'

export const createActionSheetName = (listId: number) =>
  `remove-task-list(${listId})`

export const openConfirmRemovalSheet = (listId: number) =>
  openActionSheet(createActionSheetName(listId))

export function useRemoveMutation() {
  const queryClient = useQueryClient()
  return useMutation(akira.lists.remove, {
    mutationKey: 'remove-tasks-list',
    onSuccess() {
      queryClient.invalidateQueries('lists')
    },
  })
}

export function useIsRemoving(listId: number) {
  return Boolean(
    useIsMutating({
      mutationKey: 'remove-tasks-list',
      predicate(mutation) {
        return mutation.options.variables === listId
      },
    }),
  )
}
