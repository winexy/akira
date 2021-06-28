import React from 'react'
import {MainView} from '@/views/MainView'
import {Tasks} from '@components/Tasks'
import {useQuery, useQueryClient} from 'react-query'
import {akira} from '@/lib/akira'
import {TaskQueryKeyEnum} from '@modules/tasks/config/index'

export const TasksView: React.FC = () => {
  const queryClient = useQueryClient()
  const {data: tasks = [], isLoading} = useQuery(
    TaskQueryKeyEnum.All,
    () => akira.tasks.query(),
    {
      onSuccess(tasks) {
        tasks.forEach(task => queryClient.setQueryData(['task', task.id], task))
      }
    }
  )

  return (
    <MainView>
      <div className="px-4 text-gray-600">
        <h2 className="flex items-center font-bold text-3xl">Tasks</h2>
      </div>
      <section className="mt-4 pb-4">
        <Tasks
          isPending={isLoading}
          tasks={tasks}
          tasksQueryKey={TaskQueryKeyEnum.All}
        />
      </section>
    </MainView>
  )
}
