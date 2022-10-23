import React, {FC} from 'react'
import {ActionSheet} from 'shared/ui/action-sheet'
import {TaskList} from 'modules/lists/types.d'
import {closeActionSheet} from 'shared/ui/action-sheet/model'
import {createActionSheetName, useRemoveMutation} from '../model'

type Props = {
  list: TaskList
}

export const ConfirmRemoval: FC<Props> = ({list}) => {
  const removeTaskListMutation = useRemoveMutation()

  function onRemoveConfirm() {
    removeTaskListMutation.mutate(list.id)
    closeActionSheet()
  }

  return (
    <ActionSheet
      name={createActionSheetName(list.id)}
      description={`Are you sure you want delete "${list.title}". This action is permanent`}
    >
      <ActionSheet.Action destructive onClick={onRemoveConfirm}>
        Delete task
      </ActionSheet.Action>
    </ActionSheet>
  )
}
