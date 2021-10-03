import React from 'react'
import {CheckIcon, FireIcon, TrashIcon} from '@heroicons/react/solid'
import clsx from 'clsx'
import {useHistory} from 'react-router'
import {TaskId} from 'modules/tasks/types.d'
import {ActionToast} from 'shared/ui/action-toast'
import {ActionSheet} from 'shared/ui/action-sheet'
import {openActionSheet} from 'shared/ui/action-sheet/model'
import {
  useRemoveTaskMutation,
  useToggleCompletedMutation,
  useToggleImportantMutation
} from '../hooks'

type Props = {
  taskId: TaskId
  isCompleted: boolean
  isImportant: boolean
}

export const TaskActionToast: React.FC<Props> = ({
  taskId,
  isCompleted,
  isImportant
}) => {
  const history = useHistory()
  const toggleCompletedMutation = useToggleCompletedMutation()
  const toggleImportantMutation = useToggleImportantMutation()
  const removeTaskMutation = useRemoveTaskMutation()

  function onRemoveConfirm() {
    removeTaskMutation.mutateAsync(taskId).then(() => {
      history.push('/')
    })
  }

  return (
    <>
      <ActionToast>
        <ActionToast.Button
          Icon={CheckIcon}
          className={clsx('active:text-green-600', {
            'text-green-500 dark:text-green-400': isCompleted
          })}
          onClick={() => toggleCompletedMutation.mutate(taskId)}
        />
        <ActionToast.Button
          Icon={FireIcon}
          className={clsx('active:text-red-600', {
            'text-red-500 dark:text-red-400': isImportant
          })}
          onClick={() => toggleImportantMutation.mutate(taskId)}
        />
        <ActionToast.Button
          isLoading={removeTaskMutation.isLoading}
          Icon={TrashIcon}
          className="text-red-500 dark:text-red-400 active:text-red-600"
          onClick={() => openActionSheet('delete-task-sheet')}
        />
      </ActionToast>
      <ActionSheet name="delete-task-sheet">
        <ActionSheet.Action destructive onClick={onRemoveConfirm}>
          Delete task
        </ActionSheet.Action>
      </ActionSheet>
    </>
  )
}
