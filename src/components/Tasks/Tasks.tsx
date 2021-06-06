import React from 'react'
import {Task} from '@/components/Task/Task'
import {
  changeTaskPositionFx,
  removeTaskFx,
  toggleTaskFx,
  toggleImportantFx,
  $tasksIds
} from '@/store/tasks'
import {useStore} from 'effector-react'
import {} from '../../store/tasks/slice'

export const Tasks: React.FC = () => {
  const tasksIds = useStore($tasksIds)

  return (
    <ul className="space-y-1 px-4">
      {tasksIds.map((taskId, index) => (
        <Task
          key={taskId}
          index={index}
          taskId={taskId}
          onCheck={toggleTaskFx}
          onRemove={removeTaskFx}
          onOrderChange={changeTaskPositionFx}
          onSetImportant={toggleImportantFx}
        />
      ))}
    </ul>
  )
}
