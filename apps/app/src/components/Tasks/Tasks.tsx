import React from 'react'
import {Task} from '@/components/Task/Task'
import {useStore} from 'effector-react'
import {$tasks, changeTaskPosition, removeTask, toggleTask} from '@/store/tasks'

export const Tasks: React.FC = () => {
  const tasks = useStore($tasks)

  return (
    <ul className="space-y-1 px-4">
      {tasks.map((task, index) => (
        <Task
          key={task.id}
          task={task}
          index={index}
          onCheck={toggleTask}
          onRemove={removeTask}
          onOrderChange={changeTaskPosition}
        />
      ))}
    </ul>
  )
}
