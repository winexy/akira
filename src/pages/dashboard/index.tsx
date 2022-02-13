import React, {useState} from 'react'
import {Route, Switch, useParams} from 'react-router'
import {TaskList} from 'modules/tasks/components/TaskList'
import size from 'lodash/fp/size'
import filter from 'lodash/fp/filter'

import format from 'date-fns/format'
import {PageView} from 'shared/ui/page-view'
import {useQueryClient, useMutation} from 'react-query'
import {akira} from 'shared/api/akira'
import {useTagsQuery} from 'modules/tags/hooks'
import {filterTasks, useTaskFilters} from 'modules/tasks/filters'
import {FiltersBottomSheet} from 'modules/tasks/filters/FiltersBottomSheet'
import {TaskListOperations} from 'modules/tasks/components/TaskListOperations'
import {
  SortingBottomSheet,
  useTaskSorting,
} from 'modules/tasks/sorting/SortingBottomSheet'
import {
  AddTaskForm,
  AddTaskButton,
  useAddTaskControl,
} from 'features/create-task'
import clsx from 'clsx'
import groupBy from 'lodash/fp/groupBy'
import keys from 'lodash/fp/keys'
import merge from 'lodash/merge'
import parseISO from 'date-fns/parseISO'
import ContentLoader from 'react-content-loader'
import times from 'lodash/times'
import InboxIcon from '@heroicons/react/solid/InboxIcon'
import isEmpty from 'lodash/fp/isEmpty'
import {useMyDayQuery, useWeekQuery} from 'modules/tasks/hooks'
import {TaskQuery} from 'modules/tasks/config'
import {useShimmerColors} from 'shared/ui/shimmer'
import {ApiTask, CreateTaskPayload} from 'modules/tasks/types.d'
import {usePullToRefresh} from 'shared/lib/hooks/pull-to-refresh'
import {BookOpenIcon, PlusIcon} from '@heroicons/react/solid'
import {useHistory} from 'react-router-dom'
import startOfWeek from 'date-fns/startOfWeek'
import formatISO from 'date-fns/formatISO'
import addDays from 'date-fns/addDays'

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
      {'border-purple-500 dark:border-purple-500': activeValue === value},
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

const Week: React.FC = () => {
  const {data: tasks, isLoading, refetch: refetchTasks} = useWeekQuery()

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

const Today: React.FC = () => {
  const {sortType, setSortType, sort} = useTaskSorting()
  const [filtersState, updateFilters] = useTaskFilters()

  const {data: tasks = [], isLoading, refetch: refetchTasks} = useMyDayQuery()

  const {data: tags = []} = useTagsQuery()

  const sorted = sort(filterTasks(tasks, filtersState))
  const completedTasksCount = size(filter({is_completed: true}, sorted))
  const today = format(new Date(), 'eeee, do MMM')

  usePullToRefresh({
    mainElement: '#today-wrapper',
    onRefresh: refetchTasks,
  })

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

type HabbitProps = {
  Icon: SVGIconElement
  variant?: 'outline'
}

const Habbit: React.FC<HabbitProps> = ({Icon, variant, children}) => {
  return (
    <div className="group inline-flex flex-col items-center justify-center flex-shrink-0">
      <div
        className={clsx(
          'w-12 h-12 relative',
          'flex items-center justify-center',
          'rounded-full',
          'transition',
          variant === 'outline'
            ? 'bg-white active:bg-gray-100 dark:bg-dark-500 dark:active:bg-dark-400'
            : 'bg-indigo-400 active:bg-indigo-500',
        )}
      >
        <div
          className={clsx(
            'absolute flex items-center justify-center w-11 h-11 rounded-full border-2 transition',
            variant === 'outline'
              ? 'border-gray-400 dark:border-dark-600'
              : 'border-white dark:border-dark-500',
          )}
        />
        <Icon
          className={clsx(
            'w-6 h-6',
            variant === 'outline'
              ? 'text-gray-400 dark:text-dark-100'
              : 'text-white',
          )}
        />
      </div>
      <span className="max-w-[72px] mt-2 text-xs select-none truncate">
        {children}
      </span>
    </div>
  )
}

export function DashboardPage() {
  const history = useHistory()
  const {type: mode = 'today'} = useParams<{type?: 'today' | 'week'}>()

  const addTaskControl = useAddTaskControl()
  const queryClient = useQueryClient()
  const createTaskMutation = useMutation(
    (payload: CreateTaskPayload) => {
      return akira.tasks.create(payload)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(TaskQuery.MyDay())
        queryClient.invalidateQueries(TaskQuery.Week())
      },
    },
  )

  return (
    <PageView className="flex-1">
      <AddTaskForm
        ref={addTaskControl.formRef}
        onSubmit={createTaskMutation.mutate}
        onVisibilityChange={addTaskControl.onFormVisiblityChange}
      />
      {false && (
        <div className="px-4 pb-2 flex space-x-4 overflow-auto">
          <Habbit variant="outline" Icon={PlusIcon}>
            New
          </Habbit>
          {['Drink Water', 'Leetcode Hello There', 'Run'].map(text => (
            <Habbit key={text} Icon={BookOpenIcon}>
              {text}
            </Habbit>
          ))}
        </div>
      )}
      <div className="flex">
        <Control
          activeValue={mode}
          value="today"
          onClick={() => {
            history.push('/dashboard/today')
          }}
        >
          Today
        </Control>
        <Control
          activeValue={mode}
          value="week"
          onClick={() => {
            history.push('/dashboard/week')
          }}
        >
          Week
        </Control>
        <div className="flex-1 border-b-2 border-gray-200 dark:border-gray-600" />
      </div>
      <Switch>
        <Route path="/dashboard/today">
          <Today />
        </Route>
        <Route path="/dashboard/week">
          <Week />
        </Route>
      </Switch>
      {addTaskControl.isVisible && (
        <div className="z-20 fixed bottom-0 right-0 p-4">
          <AddTaskButton onClick={addTaskControl.onAddIntent} />
        </div>
      )}
    </PageView>
  )
}
