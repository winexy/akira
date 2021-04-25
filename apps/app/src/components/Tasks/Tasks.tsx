import React from 'react'
import {Task} from '@/components/Task/Task'
import {useList} from 'effector-react'
import {
  $tasks,
  changeTaskPosition,
  removeTask,
  toggleTask
} from '@/store/tasks'

function useForceUpdate() {
  const [, updateState] = React.useState()
  return React.useCallback(() => {
    updateState({} as any)
  }, [])
}

export const Tasks: React.FC = () => {
  const tasksList = useList($tasks, (task, index) => (
    <Task
      key={task.id}
      task={task}
      index={index}
      onCheck={toggleTask}
      onRemove={removeTask}
      onOrderChange={changeTaskPosition}
    />
  ))

  return (
    <ul className="space-y-1 px-4">
      {tasksList}
    </ul>
  )
}
