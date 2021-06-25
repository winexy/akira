import React, {ReactNode} from 'react'
import {Task} from '@/components/Task/Task'
import {
  changeTaskPositionFx,
  removeTaskFx,
  toggleImportantFx,
  optimisticTaskCompletedToggle,
  TaskT
} from '@/store/tasks'
import ContentLoader from 'react-content-loader'
import isEmpty from 'lodash/fp/isEmpty'
import times from 'lodash/fp/times'
import {InboxIcon} from '@heroicons/react/solid'

type Props = {
  isPending: boolean
  tasks: TaskT[]
  noTasksSlot?: ReactNode
}

export const Tasks: React.FC<Props> = ({isPending, tasks, noTasksSlot}) => {
  if (isPending) {
    const taskHeight = 56
    const spacing = 4
    const count = 8
    const height = taskHeight * count + (count - 1) * spacing
    return (
      <section className="px-4">
        <ContentLoader
          speed={2}
          width="100%"
          height={height}
          backgroundColor="#ffffff"
          foregroundColor="#e9e9e9"
        >
          {times(
            n => (
              <rect
                key={n}
                x="0"
                y={n * taskHeight + n * spacing}
                rx="6"
                ry="6"
                width="100%"
                height={taskHeight}
              />
            ),
            count
          )}
        </ContentLoader>
      </section>
    )
  }

  if (isEmpty(tasks)) {
    return (
      <div className="flex flex-col justify-center items-center pt-12 text-gray-700">
        <InboxIcon className="w-12 h-12" />
        <h2 className="mt-2 font-semibold text-lg">No tasks</h2>
        {noTasksSlot}
      </div>
    )
  }

  return (
    <ul className="space-y-0.5 px-4">
      {tasks.map((task, index) => (
        <Task
          key={task.id}
          index={index}
          task={task}
          onCheck={optimisticTaskCompletedToggle}
          onRemove={removeTaskFx}
          onOrderChange={changeTaskPositionFx}
          onSetImportant={toggleImportantFx}
        />
      ))}
    </ul>
  )
}
