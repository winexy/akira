import React from 'react'
import {SortAscendingIcon} from '@heroicons/react/solid'
import {TaskForm} from '@components/TaskForm/TaskForm'
import {Tasks} from '@components/Tasks'
import size from 'lodash/fp/size'
import filter from 'lodash/fp/filter'

import clsx from 'clsx'
import format from 'date-fns/format'
import {MainView} from '@views/MainView'
import {showBottomSheet} from '@store/bottom-sheet/index'
import {FilterIcon} from '@heroicons/react/outline'
import {useQuery, useQueryClient, useMutation} from 'react-query'
import {akira} from '@lib/akira'
import {onMyDayFetch} from '@modules/tasks/store'
import {TaskT} from '@store/tasks'
import {TaskQueryKeyEnum} from '@modules/tasks/config/index'
import {useTagsQuery} from '@modules/tags/hooks'
import {filterTasks, useTaskFilters} from '@modules/tasks/filters'
import {FiltersBottomSheet} from '@modules/tasks/filters/FiltersBottomSheet'
import {
  SortingBottomSheet,
  useTaskSorting
} from '@modules/tasks/sorting/SortingBottomSheet'
import {
  AddTaskButton,
  useAddTaskControl
} from '@/modules/tasks/components/AddTaskButton'

export function TodayView() {
  const addTaskControl = useAddTaskControl()
  const {sortType, setSortType, sort} = useTaskSorting()
  const [filtersState, updateFilters] = useTaskFilters()
  const queryClient = useQueryClient()
  const createTaskMutation = useMutation(
    (title: string) => {
      return akira.tasks.create(title)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['myday'])
      }
    }
  )

  const {data: tasks = [], isLoading} = useQuery<TaskT[]>(
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

  return (
    <MainView className="flex-1">
      <TaskForm
        ref={addTaskControl.formRef}
        onSubmit={createTaskMutation.mutate}
        onVisibilityChange={addTaskControl.onFormVisiblityChange}
      />
      <div className="flex justify-between items-center px-4 text-gray-600">
        <div>
          <h2 className="font-bold text-3xl">Today</h2>
          <p className="text-sm">{today}</p>
        </div>
        <span className="text-gray-700 text-4xl font-bold">
          {completedTasksCount} / {size(sorted)}
        </span>
      </div>
      <FiltersBottomSheet
        canReset={size(tasks) !== size(sorted)}
        state={filtersState}
        tags={tags}
        onChange={updateFilters}
      />
      <SortingBottomSheet sortType={sortType} onChange={setSortType} />
      <section className="mt-4 pb-24">
        <Tasks isPending={isLoading} tasks={sorted} />
      </section>
      <div className="fixed bottom-0 right-0 left-0 py-7 flex items-center mt-4 px-4 from-gray-100 bg-gradient-to-t">
        <button
          className={clsx(
            'flex items-center px-3 py-1 ',
            'border',
            'font-semibold ',
            'rounded-md shadow-md',
            'active:shadow-lg',
            'focus:outline-none ',
            size(sorted) !== size(tasks)
              ? 'text-white bg-blue-500 border-blue-600 active:bg-blue-600 active:border-blue-700'
              : 'bg-gray-100 border-gray-300 active:bg-gray-200'
          )}
          onClick={() => showBottomSheet('filters')}
        >
          <FilterIcon className="w-4 h-4 mr-2" />
          Filters
        </button>
        <button
          className={clsx(
            'ml-4 flex items-center px-3 py-1 ',
            'border',
            'font-semibold',
            'rounded-md shadow-md',
            'active:bg-gray-200',
            'active:shadow-lg',
            'focus:outline-none',
            sortType
              ? 'text-white bg-blue-500 border-blue-600 active:bg-blue-600 active:border-blue-700'
              : 'bg-gray-100 border-gray-300 active:bg-gray-200'
          )}
          onClick={() => showBottomSheet('sorting')}
        >
          <SortAscendingIcon className="w-4 h-4 mr-2" />
          Sort
          {/* <WIP className="ml-2" /> */}
        </button>
      </div>
      {addTaskControl.isVisible && (
        <div className="z-20 fixed bottom-0 right-0 p-4">
          <AddTaskButton onClick={addTaskControl.onAddIntent} />
        </div>
      )}
    </MainView>
  )
}
