import React, {useEffect} from 'react'
import format from 'date-fns/format'
import filter from 'lodash/fp/filter'
import size from 'lodash/fp/size'
import {taskTagModel} from 'entities/task-tag'
import {filterTasks, useTaskFilters} from 'modules/tasks/filters'
import {
  SortingBottomSheet,
  useTaskSorting,
} from 'modules/tasks/sorting/SortingBottomSheet'
import {usePullToRefresh} from 'shared/lib/hooks/pull-to-refresh'
import {TaskList} from 'modules/tasks/components/TaskList'
import {TaskListOperations} from 'modules/tasks/components/TaskListOperations'
import {FiltersBottomSheet} from 'modules/tasks/filters/FiltersBottomSheet'
import {taskModel} from 'entities/task'
import amplitude from 'amplitude-js'

const TodayPage: React.FC = () => {
  const {sortType, setSortType, sort} = useTaskSorting()
  const [filtersState, updateFilters] = useTaskFilters()

  const {
    data: tasks = [],
    isLoading,
    refetch: refetchTasks,
  } = taskModel.useMyDayQuery()

  const {data: tags = []} = taskTagModel.useTagsQuery()

  const sorted = sort(filterTasks(tasks, filtersState))
  const completedTasksCount = size(filter({is_completed: true}, sorted))
  const today = format(new Date(), 'eeee, do MMM')

  usePullToRefresh({
    mainElement: '#today-wrapper',
    onRefresh: refetchTasks,
  })

  useEffect(() => {
    amplitude.getInstance().logEvent('ViewTodayTasks')
  }, [])

  return (
    <div id="today-wrapper">
      <div className="mt-2 flex justify-between items-center px-4">
        <p className="font-bold text-xl">{today}</p>
        <span className="text-2xl font-bold">
          {completedTasksCount} / {size(sorted)}
        </span>
      </div>
      <section className="mt-2 pb-24 px-4">
        <TaskList isPending={isLoading} tasks={sorted} />
      </section>
      <TaskListOperations
        isFiltered={size(sorted) !== size(tasks)}
        isSorted={Boolean(sortType)}
      />
      <FiltersBottomSheet
        canReset={size(tasks) !== size(sorted)}
        state={filtersState}
        tags={tags}
        onChange={updateFilters}
      />
      <SortingBottomSheet sortType={sortType} onChange={setSortType} />
    </div>
  )
}

export {TodayPage}
