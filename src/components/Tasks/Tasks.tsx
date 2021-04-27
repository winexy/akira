import React from 'react'
import {Task} from '@/components/Task/Task'
import { useSelector, useDispatch } from '@/store'
import {
  changeTaskPosition,
  removeTask,
  selectTasks,
  toggleTask,
  toggleImportant
} from '@/store/tasks'

export const Tasks: React.FC = () => {
  const dispatch = useDispatch()
  const tasks = useSelector(selectTasks)

  return (
    <ul className="space-y-1 px-4">
      {tasks.map((task, index) => (
        <Task
          key={task.id}
          task={task}
          index={index}
          onCheck={id => dispatch(toggleTask(id))}
          onRemove={id => dispatch(removeTask(id))}
          onOrderChange={params => dispatch(changeTaskPosition(params))}
          onSetImportant={id => dispatch(toggleImportant(id))}
        />
      ))}
    </ul>
  )
}
