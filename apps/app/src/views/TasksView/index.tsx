import React from 'react'
import {MainView} from '@/views/MainView'
import {Tasks} from '@components/Tasks'
import {useTasksQuery} from '@modules/tasks/hooks'
import {TaskForm} from '@components/TaskForm/TaskForm'
import {akira} from '@lib/akira'
import {useMutation, useQueryClient} from 'react-query'
import {FiltersBottomSheet} from '@modules/tasks/filters/FiltersBottomSheet'
import {
  SortingBottomSheet,
  useTaskSorting
} from '@modules/tasks/sorting/SortingBottomSheet'
import {
  AddTaskButton,
  useAddTaskControl
} from '@modules/tasks/components/AddTaskButton'
import {useTaskFilters, filterTasks} from '@modules/tasks/filters'
import size from 'lodash/fp/size'
import {useTagsQuery} from '@modules/tags/hooks'
import {TaskListOperations} from '@modules/tasks/components/TaskListOperations'
import {TaskQueryKeyEnum} from '@modules/tasks/config'
import {CreateTaskMeta} from '@lib/akira/tasks/tasks'

export const TasksView: React.FC = () => {
  const {data: tasks = [], isLoading} = useTasksQuery()
  const {data: tags = []} = useTagsQuery()
  const addTaskControl = useAddTaskControl()
  const [filtersState, updateFilters] = useTaskFilters()
  const {sortType, setSortType, sort} = useTaskSorting()
  const queryClient = useQueryClient()

  const createTaskMutation = useMutation(
    ({title, meta}: {title: string; meta: CreateTaskMeta}) => {
      return akira.tasks.create(title, meta)
    },
    {
      onSuccess(task) {
        queryClient.setQueryData(TaskQueryKeyEnum.All, [task, ...tasks])
      }
    }
  )

  const sorted = sort(filterTasks(tasks, filtersState))

  return (
    <MainView>
      <TaskForm
        ref={addTaskControl.formRef}
        onSubmit={createTaskMutation.mutate}
        onVisibilityChange={addTaskControl.onFormVisiblityChange}
      />
      <div className="px-4 text-gray-600">
        <h2 className="flex items-center font-bold text-3xl">Tasks</h2>
      </div>
      <section className="mt-4 pb-4">
        <Tasks isPending={isLoading} tasks={sorted} />
      </section>
      <FiltersBottomSheet
        canReset={size(tasks) !== size(sorted)}
        state={filtersState}
        tags={tags}
        onChange={updateFilters}
      />
      <SortingBottomSheet sortType={sortType} onChange={setSortType} />
      <TaskListOperations
        isFiltered={size(sorted) !== size(tasks)}
        isSorted={Boolean(sortType)}
      />
      {addTaskControl.isVisible && (
        <div className="z-20 fixed bottom-0 right-0 p-4">
          <AddTaskButton onClick={addTaskControl.onAddIntent} />
        </div>
      )}
    </MainView>
  )
}
