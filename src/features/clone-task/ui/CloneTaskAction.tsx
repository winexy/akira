import React, {FC} from 'react'
import {useHistory} from 'react-router'
import {ClipboardCopyIcon} from '@heroicons/react/outline'
import {TaskActionList} from 'modules/tasks/components'
import {Transition} from 'shared/ui/transition'
import {Spin} from 'shared/ui/spin'
import {useCloneTaskMutation} from '../model'

type Props = {
  taskId: string
}

export const CloneTaskAction: FC<Props> = ({taskId}) => {
  const cloneTaskMutation = useCloneTaskMutation(taskId)
  const history = useHistory()

  function cloneTask() {
    cloneTaskMutation.mutateAsync().then(cloneId => {
      history.push(`/tasks/${cloneId}`)
    })
  }

  return (
    <TaskActionList.Item>
      <TaskActionList.Button
        disabled={cloneTaskMutation.isLoading}
        Icon={ClipboardCopyIcon}
        onClick={cloneTask}
      >
        Clone task
        <Transition.Scale appear in={cloneTaskMutation.isLoading} unmountOnExit>
          <Spin className="ml-2 w-4 h-4 text-gray-400" />
        </Transition.Scale>
      </TaskActionList.Button>
    </TaskActionList.Item>
  )
}
