import React from 'react'
import {useAtom, useAction} from '@reatom/react'
import {Task} from '@/components/Task/Task'
import {
  changeTaskPosition,
  removeTask,
  tasksAtom,
  toggleTask
} from '@/store/tasks'

function useForceUpdate() {
  const [, updateState] = React.useState()
  return React.useCallback(() => {
    updateState({} as any)
  }, [])
}

export const Tasks: React.FC = () => {
  const tasks = useAtom(tasksAtom)
  const handleRemoveTask = useAction(removeTask)
  const handleToggleTask = useAction(toggleTask)
  const handleChangeTaskPosition = useAction(changeTaskPosition)
  const forceUpdate = useForceUpdate()

  // @ts-ignore
  window.forceUpdate = forceUpdate

  return (
    <ul className="space-y-1 px-4">
      {tasks.map((task, index) => (
        <Task
          key={task.id}
          task={task}
          index={index}
          onCheck={handleToggleTask}
          onRemove={handleRemoveTask}
          onOrderChange={handleChangeTaskPosition}
        />
      ))}
    </ul>
  )
}
