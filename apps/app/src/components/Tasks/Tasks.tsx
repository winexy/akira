import React from 'react'
import {useAtom, useAction} from '@reatom/react'
import {Task} from '@/components/Task/Task'
import {
  changeTaskPosition,
  removeTask,
  tasksAtom,
  toggleTask
} from '@/store/tasks'

export const Tasks: React.FC = () => {
  const tasks = useAtom(tasksAtom)
  const handleRemoveTask = useAction(removeTask)
  const handleToggleTask = useAction(toggleTask)
  const handleChangeTaskPosition = useAction(changeTaskPosition)

  function onOrderChange(fromIndex: number, toIndex: number) {
    handleChangeTaskPosition({fromIndex, toIndex})
  }

  return (
    <ul className="space-y-1 px-4">
      {tasks.map((task, index) => (
        <Task
          key={task.id}
          task={task}
          index={index}
          onCheck={handleToggleTask}
          onRemove={handleRemoveTask}
          onOrderChange={onOrderChange}
        />
      ))}
    </ul>
  )
}
