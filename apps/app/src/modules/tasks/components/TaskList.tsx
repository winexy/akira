import React, {ReactNode} from 'react'
import {Task} from 'modules/tasks/components/Task'
import {ApiTask} from 'modules/tasks/types.d'
import ContentLoader from 'react-content-loader'
import isEmpty from 'lodash/fp/isEmpty'
import times from 'lodash/fp/times'
import noop from 'lodash/fp/noop'
import {
  useToggleCompletedMutation,
  useToggleImportantMutation,
  useRemoveTaskMutation,
} from 'modules/tasks/hooks'
import clsx from 'clsx'
import {useShimmerColors} from 'shared/ui/shimmer'
import {Empty} from 'shared/ui/empty'

type Props = {
  isPending: boolean
  tasks: ApiTask[]
  noTasksSlot?: ReactNode
  className?: string
}

export const TaskList: React.FC<Props> = ({
  isPending,
  tasks,
  noTasksSlot,
  className,
}) => {
  const toggleTaskCompleteMutation = useToggleCompletedMutation()
  const toggleImportantMutation = useToggleImportantMutation()
  const removeTaskMutation = useRemoveTaskMutation()
  const {backgroundColor, foregroundColor} = useShimmerColors()

  if (isPending) {
    const taskHeight = 56
    const spacing = 4
    const count = 8
    const height = taskHeight * count + (count - 1) * spacing
    return (
      <section className={className}>
        <ContentLoader
          speed={2}
          width="100%"
          height={height}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
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
            count,
          )}
        </ContentLoader>
      </section>
    )
  }

  if (isEmpty(tasks)) {
    return <Empty message="No tasks">{noTasksSlot}</Empty>
  }

  return (
    <ul className={clsx('space-y-0.5', className)}>
      {tasks.map((task, index) => (
        <Task
          key={task.id}
          index={index}
          task={task}
          onCheck={toggleTaskCompleteMutation.mutate}
          onRemove={removeTaskMutation.mutate}
          onOrderChange={noop}
          onSetImportant={toggleImportantMutation.mutate}
        />
      ))}
    </ul>
  )
}
