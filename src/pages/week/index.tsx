import times from 'lodash/times'
import React from 'react'
import ContentLoader from 'react-content-loader'
import {usePullToRefresh} from 'shared/lib/hooks/pull-to-refresh'
import {useShimmerColors} from 'shared/ui/shimmer'
import startOfWeek from 'date-fns/startOfWeek'
import formatISO from 'date-fns/formatISO'
import addDays from 'date-fns/addDays'
import groupBy from 'lodash/fp/groupBy'
import keys from 'lodash/fp/keys'
import merge from 'lodash/merge'
import parseISO from 'date-fns/parseISO'
import InboxIcon from '@heroicons/react/solid/InboxIcon'
import isEmpty from 'lodash/fp/isEmpty'
import {TaskList} from 'modules/tasks/components/TaskList'
import format from 'date-fns/format'
import {ApiTask} from 'modules/tasks/types.d'
import {taskModel} from 'entities/task'

function transformResponse(tasks: Array<ApiTask> | undefined) {
  const defaultRecord: Record<string, []> = {}

  let date = startOfWeek(new Date(), {weekStartsOn: 1})
  times(7, () => {
    defaultRecord[formatISO(date)] = []
    date = addDays(date, 1)
  })

  const byDay = merge(
    defaultRecord,
    groupBy(task => formatISO(parseISO(task.date ?? '')), tasks),
  )

  const days = keys(byDay).sort()

  return {byDay, days}
}

const WeekPage: React.FC = () => {
  const {
    data: tasks,
    isLoading,
    refetch: refetchTasks,
  } = taskModel.useWeekQuery()

  const {backgroundColor, foregroundColor} = useShimmerColors()

  usePullToRefresh({
    mainElement: '#week-wrapper',
    onRefresh: refetchTasks,
  })

  if (isLoading) {
    return (
      <div className="px-4">
        {times(4, x => (
          <ContentLoader
            key={x}
            speed={2}
            width="100%"
            className="mt-4"
            height="98px"
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            <rect x="0" y={0} rx="6" ry="6" width="40%" height={28} />
            <rect x="0" y={38} rx="6" ry="6" width="100%" height={60} />
          </ContentLoader>
        ))}
      </div>
    )
  }

  if (isEmpty(tasks)) {
    return (
      <div id="week-wrapper" className="px-4 h-full flex flex-col items-center">
        <InboxIcon className="mt-32 w-12 h-12" />
        <h2 className="mt-2 font-semibold text-lg">No tasks</h2>
      </div>
    )
  }

  const {byDay, days} = transformResponse(tasks)

  return (
    <div id="week-wrapper" className="mt-2 px-4 space-y-2 pb-24">
      {days.map(day => (
        <section key={day}>
          <h2 className="font-bold text-2xl">
            {format(parseISO(day), 'EEEE')}
          </h2>
          {isEmpty(byDay[day]) ? (
            <div className="mt-2 px-4 h-12 flex items-center w-full rounded-md bg-gray-50">
              <div className="w-5 h-5 rounded-md bg-white border border-gray-100" />
            </div>
          ) : (
            <TaskList className="mt-2" isPending={false} tasks={byDay[day]} />
          )}
        </section>
      ))}
    </div>
  )
}

export {WeekPage}
