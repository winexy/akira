import React from 'react'
import {Task} from '@/components/Task/Task'
import {TaskT} from '@/models/Task'

type TasksProps = {
  tasks: TaskT[]
  onCheck(newState: TaskT['id']): void
  onRemove(id: TaskT['id']): void
  onOrderChange(dragIndex: number, hoverIndex: number): void
}

export const Tasks: React.FC<TasksProps> = ({
  tasks,
  onCheck,
  onRemove,
  onOrderChange
}) => {
  return (
    <ul className="space-y-1 px-4">
      {tasks.map((task, index) => (
        <Task
          key={task.id}
          task={task}
          index={index}
          onCheck={onCheck}
          onRemove={onRemove}
          onOrderChange={onOrderChange}
        />
      ))}
    </ul>
  )
}
