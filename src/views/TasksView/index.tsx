import React, {useEffect} from 'react'
import {MainView} from '@/views/MainView'
import {useStore} from 'effector-react'
import {$tasksIds, queryTasksFx} from '@store/tasks/slice'
import {Tasks} from '@components/Tasks'

export const TasksView: React.FC = () => {
  const isPending = useStore(queryTasksFx.pending)
  const tasksIds = useStore($tasksIds)

  useEffect(() => {
    queryTasksFx()
  }, [])

  return (
    <MainView>
      <div className="px-4 text-gray-600">
        <h2 className="flex items-center font-bold text-3xl">Tasks</h2>
      </div>
      <section className="mt-4">
        <Tasks isPending={isPending} tasksIds={tasksIds} />
      </section>
    </MainView>
  )
}
