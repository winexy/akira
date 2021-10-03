import React, {useState} from 'react'
import {TaskForm} from '@modules/tasks/components/TaskForm'
import {TaskList} from '@modules/tasks/components/TaskList'
import size from 'lodash/fp/size'
import filter from 'lodash/fp/filter'

import format from 'date-fns/format'
import {PageView} from '@shared/ui/page-view'
import {useQueryClient, useMutation} from 'react-query'
import {akira} from '@shared/api/akira'
import {useTagsQuery} from '@modules/tags/hooks'
import {filterTasks, useTaskFilters} from '@modules/tasks/filters'
import {FiltersBottomSheet} from '@modules/tasks/filters/FiltersBottomSheet'
import {TaskListOperations} from '@modules/tasks/components/TaskListOperations'
import {
  SortingBottomSheet,
  useTaskSorting
} from '@modules/tasks/sorting/SortingBottomSheet'
import {
  AddTaskButton,
  useAddTaskControl
} from '@/modules/tasks/components/AddTaskButton'
import clsx from 'clsx'
import groupBy from 'lodash/fp/groupBy'
import keys from 'lodash/fp/keys'
import parseISO from 'date-fns/parseISO'
import ContentLoader from 'react-content-loader'
import times from 'lodash/fp/times'
import InboxIcon from '@heroicons/react/solid/InboxIcon'
import isEmpty from 'lodash/fp/isEmpty'
import {useMyDayQuery, useWeekQuery} from '@modules/tasks/hooks'
import {TaskQuery} from '@modules/tasks/config'
import {useContentLoaderColor} from '@/config/content-loader'
import {CreateTaskPayload} from '@modules/tasks/types.d'

const Control: React.FC<{
  value: string
  activeValue: string
  onClick(value: string): void
}> = ({activeValue, value, children, onClick}) => (
  <button
    type="button"
    className={clsx(
      'py-1 px-4 flex items-center justify-center',
      'font-bold text-xl',
      'bg-transparent border-b-2 dark:border-gray-600',
      'transition',
      'active:text-purple-500 dark:active:text-gray-300',
      'focus:outline-none',
      {'border-purple-500 dark:border-purple-500': activeValue === value}
    )}
    onClick={() => onClick(value)}
  >
    {children}
  </button>
)

const SnackBar: React.FC = () => (
  <div className="fixed bottom-0 w-full px-4 p-1 bg-blue-500">
    <p className="text-white text-sm text-center">Refreshing...</p>
  </div>
)

const Week: React.FC = () => {
  const {data: tasks, isLoading, isFetching} = useWeekQuery()
  const {backgroundColor, foregroundColor} = useContentLoaderColor()

  const byDay = groupBy(task => task.schedule?.date ?? '', tasks)
  const days = keys(byDay).sort()

  if (isLoading) {
    return (
      <div className="px-4">
        {times(
          x => (
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
          ),
          4
        )}
      </div>
    )
  }

  if (isEmpty(tasks)) {
    return (
      <div className="px-4 h-full flex flex-col items-center">
        <InboxIcon className="mt-32 w-12 h-12" />
        <h2 className="mt-2 font-semibold text-lg">No tasks</h2>
      </div>
    )
  }

  return (
    <>
      <div className="mt-2 px-4 space-y-2 pb-24">
        {days.map(day => (
          <section key={day}>
            <h2 className="font-bold text-2xl">
              {format(parseISO(day), 'EEEE')}
            </h2>
            <TaskList className="mt-2" isPending={false} tasks={byDay[day]} />
          </section>
        ))}
      </div>
      {!isLoading && isFetching && <SnackBar />}
    </>
  )
}

const Today: React.FC = () => {
  const {sortType, setSortType, sort} = useTaskSorting()
  const [filtersState, updateFilters] = useTaskFilters()

  const {data: tasks = [], isLoading, isFetching} = useMyDayQuery()
  const {data: tags = []} = useTagsQuery()

  const sorted = sort(filterTasks(tasks, filtersState))
  const completedTasksCount = size(filter({is_completed: true}, sorted))
  const today = format(new Date(), 'eeee, do MMM')

  return (
    <>
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
      {!isLoading && isFetching && <SnackBar />}
    </>
  )
}

export function TodayView() {
  const addTaskControl = useAddTaskControl()
  const queryClient = useQueryClient()
  const createTaskMutation = useMutation(
    (payload: CreateTaskPayload) => {
      return akira.tasks.create(payload)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(TaskQuery.MyDay())
      }
    }
  )

  const [mode, setMode] = useState('today')

  return (
    <PageView className="flex-1">
      <TaskForm
        ref={addTaskControl.formRef}
        onSubmit={createTaskMutation.mutate}
        onVisibilityChange={addTaskControl.onFormVisiblityChange}
      />
      <div className="flex">
        <Control activeValue={mode} value="today" onClick={setMode}>
          Today
        </Control>
        <Control activeValue={mode} value="week" onClick={setMode}>
          Week
        </Control>
        <div className="flex-1 border-b-2 border-gray-200 dark:border-gray-600" />
      </div>
      {mode === 'today' ? <Today /> : <Week />}
      {addTaskControl.isVisible && (
        <div className="z-20 fixed bottom-0 right-0 p-4">
          <AddTaskButton onClick={addTaskControl.onAddIntent} />
        </div>
      )}
    </PageView>
  )
}
