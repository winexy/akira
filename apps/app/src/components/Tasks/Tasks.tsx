import React from 'react'
import {Task} from '@/components/Task/Task'
import {
  changeTaskPositionFx,
  removeTaskFx,
  toggleTaskFx,
  toggleImportantFx,
  $tasksIds,
  loadTasksFx
} from '@/store/tasks'
import {useStore} from 'effector-react'
import ContentLoader from 'react-content-loader'
import {times} from 'lodash/fp'

export const Tasks: React.FC = () => {
  const tasksIds = useStore($tasksIds)
  const isPending = useStore(loadTasksFx.pending)

  if (isPending) {
    const taskHeight = 64
    const spacing = 4
    const count = 3
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
