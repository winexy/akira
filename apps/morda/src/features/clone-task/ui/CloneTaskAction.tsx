import React, {FC, useRef} from 'react'
import {useNavigate} from 'react-router'
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
  const navigate = useNavigate()
  const spinRef = useRef(null)

  function cloneTask() {
    cloneTaskMutation.mutateAsync().then(cloneId => {
      navigate(`/tasks/${cloneId}`)
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
        <Transition.Scale
          nodeRef={spinRef}
          appear
          in={cloneTaskMutation.isLoading}
          unmountOnExit
        >
          <Spin ref={spinRef} className="ml-2 w-4 h-4 text-gray-400" />
        </Transition.Scale>
      </TaskActionList.Button>
    </TaskActionList.Item>
  )
}
