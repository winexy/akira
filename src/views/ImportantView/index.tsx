import React, {useEffect} from 'react'
import {View} from '@views/View/View'
import {useStore} from 'effector-react'
import {Link} from 'react-router-dom'
import {$tasksIds, queryTasksFx} from '@store/tasks/slice'
import {Tasks} from '@components/Tasks'
import {FireIcon} from '@heroicons/react/solid'

export const ImportantView: React.FC = () => {
  const isPending = useStore(queryTasksFx.pending)
  const tasksIds = useStore($tasksIds)

  useEffect(() => {
    queryTasksFx({is_important: 1})
  }, [])

  return (
    <View>
      <div className="px-4 text-gray-600">
        <h2 className="flex items-center font-bold text-3xl">
          Important
          <FireIcon className="w-8 h-8 ml-2 text-red-500" />
        </h2>
      </div>
      <section className="mt-4">
        <Tasks
          isPending={isPending}
          tasksIds={tasksIds}
          noTasksSlot={
            <Link to="/" className="mt-8 text-blue-500 underline">
              Go to home
            </Link>
          }
        />
      </section>
    </View>
  )
}
