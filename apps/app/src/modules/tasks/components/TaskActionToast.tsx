import React from 'react'
import {ActionToast} from '@components/ActionToast'
import {CheckIcon, FireIcon, TrashIcon} from '@heroicons/react/solid'
import clsx from 'clsx'
import {useHistory} from 'react-router'
import {TaskIdT} from '@store/tasks'
import {
  useRemoveTaskMutation,
  useToggleCompletedMutation,
  useToggleImportantMutation
} from '../hooks'

type Props = {
  taskId: TaskIdT
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

  function onRemove() {
    // eslint-disable-next-line
    if (confirm('Are you sure? This action cannot be undone')) {
      removeTaskMutation.mutateAsync(taskId).then(() => {
        history.push('/')
      })
    }
  }

  return (
    <ActionToast>
      <ActionToast.Button
        Icon={CheckIcon}
        className={clsx('active:text-green-600', {
          'text-green-500': isCompleted
        })}
        onClick={() => toggleCompletedMutation.mutate(taskId)}
      />
      <ActionToast.Button
        Icon={FireIcon}
        className={clsx('active:text-red-600', {
          'text-red-500': isImportant
        })}
        onClick={() => toggleImportantMutation.mutate(taskId)}
      />
      <ActionToast.Button
        isLoading={removeTaskMutation.isLoading}
        Icon={TrashIcon}
        className="text-red-500 active:text-red-600"
        onClick={onRemove}
      />
    </ActionToast>
  )
}
