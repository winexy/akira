import React, {useState} from 'react'
import {TaskForm} from '@components/TaskForm/TaskForm'
import {Tasks} from '@components/Tasks'
import size from 'lodash/fp/size'
import filter from 'lodash/fp/filter'

import format from 'date-fns/format'
import {MainView} from '@views/MainView'
import {useQuery, useQueryClient, useMutation} from 'react-query'
import {akira} from '@lib/akira'
import {onMyDayFetch} from '@modules/tasks/store'
import {ApiTask} from '@modules/tasks/types.d'
import {TaskQueryKeyEnum} from '@modules/tasks/config/index'
import {useTagsQuery} from '@modules/tags/hooks'
import {filterTasks, useTaskFilters} from '@modules/tasks/filters'
import {FiltersBottomSheet} from '@modules/tasks/filters/FiltersBottomSheet'
import {TaskListOperations} from '@modules/tasks/components/TaskListOperations'
import {CreateTaskMeta} from '@lib/akira/tasks/tasks'
import {
  SortingBottomSheet,
  useTaskSorting
} from '@modules/tasks/sorting/SortingBottomSheet'
import {
  AddTaskButton,
  useAddTaskControl
} from '@/modules/tasks/components/AddTaskButton'
import clsx from 'clsx'
import {api} from '@lib/api'
import groupBy from 'lodash/groupBy'
import keys from 'lodash/keys'
import parseISO from 'date-fns/parseISO'

const Control: React.FC<{
  value: string
  activeValue: string
  onClick(value: string): void
}> = ({activeValue, value, children, onClick}) => (
  <button
    type="button"
    className={clsx(
      'h-8 flex items-center justify-center',
      'font-semibold',
      'flex-1 rounded-md border-none',
      'focus:outline-none',
      'transition-all',
      {'bg-white shadow-sm': activeValue === value}
    )}
    onClick={() => onClick(value)}
  >
    {children}
  </button>
)

const Week: React.FC = () => {
  const {data: tasks} = useQuery<Array<ApiTask>>(
    'week',
    () => api.get('task-scheduler/week').then(response => response.data),
    {
      placeholderData: []
    }
  )

  const byDay = groupBy(tasks, task => task.schedule?.date ?? '')
  const days = keys(byDay)

  return (
    <div className="mt-2 px-4 space-y-2 pb-24">
      {days.map(day => (
        <section key={day}>
          <h2 className="font-bold text-2xl text-gray-700">
            {format(parseISO(day), 'EEEE')}
          </h2>
          <Tasks className="mt-2" isPending={false} tasks={byDay[day]} />
        </section>
      ))}
    </div>
  )
}

export function TodayView() {
  const addTaskControl = useAddTaskControl()
  const {sortType, setSortType, sort} = useTaskSorting()
  const [filtersState, updateFilters] = useTaskFilters()
  const queryClient = useQueryClient()
  const createTaskMutation = useMutation(
    (payload: {title: string; meta: CreateTaskMeta}) => {
      return akira.tasks.createForMyDay(payload.title, payload.meta)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['myday'])
      }
    }
  )

  const {data: tasks = [], isLoading} = useQuery<ApiTask[]>(
    TaskQueryKeyEnum.MyDay,
    akira.myday.tasks,
    {
      onSuccess(tasks) {
        onMyDayFetch(tasks)
        tasks.forEach(task => {
          queryClient.setQueryData(['task', task.id], task)
        })
      }
    }
  )

  const {data: tags = []} = useTagsQuery()

  const sorted = sort(filterTasks(tasks, filtersState))
  const completedTasksCount = size(filter({is_completed: true}, sorted))

  const today = format(new Date(), 'eeee, do MMMM')

  const [mode, setMode] = useState('today')

  return (
    <MainView className="flex-1">
      <TaskForm
        ref={addTaskControl.formRef}
        onSubmit={createTaskMutation.mutate}
        onVisibilityChange={addTaskControl.onFormVisiblityChange}
      />
      <div className="px-4">
        <div className="flex p-0.5 rounded-md bg-gray-200 text-gray-700">
          <Control activeValue={mode} value="today" onClick={setMode}>
            today
          </Control>
          <Control activeValue={mode} value="week" onClick={setMode}>
            week
          </Control>
        </div>
      </div>
      {mode === 'today' ? (
        <>
          <div className="mt-2 flex justify-between items-center px-4 text-gray-600">
            <div>
              <h2 className="font-bold text-3xl">Today</h2>
              <p className="text-sm">{today}</p>
            </div>
            <span className="text-gray-700 text-4xl font-bold">
              {completedTasksCount} / {size(sorted)}
            </span>
          </div>
          <section className="mt-4 pb-24 px-4">
            <Tasks isPending={isLoading} tasks={sorted} />
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
        </>
      ) : (
        <Week />
      )}
      {addTaskControl.isVisible && (
        <div className="z-20 fixed bottom-0 right-0 p-4">
          <AddTaskButton onClick={addTaskControl.onAddIntent} />
        </div>
      )}
    </MainView>
  )
}
