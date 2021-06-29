import React from 'react'
import {MainView} from '@/views/MainView'
import {Tasks} from '@components/Tasks'
import {useTasksQuery} from '@modules/tasks/hooks'

export const TasksView: React.FC = () => {
  const {data: tasks = [], isLoading} = useTasksQuery()

  return (
    <MainView>
      <div className="px-4 text-gray-600">
        <h2 className="flex items-center font-bold text-3xl">Tasks</h2>
      </div>
      <section className="mt-4 pb-4">
        <Tasks isPending={isLoading} tasks={tasks} />
      </section>
    </MainView>
  )
}
