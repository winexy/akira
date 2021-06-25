import React from 'react'
import {MainView} from '@/views/MainView'
import {Link} from 'react-router-dom'
import {Tasks} from '@components/Tasks'
import {FireIcon} from '@heroicons/react/solid'
import {useQuery, useQueryClient} from 'react-query'
import {akira} from '@/lib/akira'

export const ImportantView: React.FC = () => {
  const queryClient = useQueryClient()
  const {data: tasks = [], isLoading} = useQuery(
    'tasks:important',
    () => akira.tasks.query({is_important: 1}),
    {
      onSuccess(tasks) {
        tasks.forEach(task => {
          queryClient.setQueryData(['task', task.id], task)
        })
      }
    }
  )

  return (
    <MainView>
      <div className="px-4 text-gray-600">
        <h2 className="flex items-center font-bold text-3xl">
          Important
          <FireIcon className="w-8 h-8 ml-2 text-red-500" />
        </h2>
      </div>
      <section className="mt-4">
        <Tasks
          isPending={isLoading}
          tasks={tasks}
          noTasksSlot={
            <Link to="/" className="mt-8 text-blue-500 underline">
              Go to home
            </Link>
          }
        />
      </section>
    </MainView>
  )
}
