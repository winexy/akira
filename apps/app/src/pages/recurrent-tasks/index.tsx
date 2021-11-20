import React from 'react'
import {useQuery} from 'react-query'
import {PageView} from 'shared/ui/page-view'
import {api} from 'shared/api'
import {Print} from 'shared/ui/print'
import {ApiTask} from 'modules/tasks/types.d'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import clsx from 'clsx'
import RRule from 'rrule'
import capitalize from 'lodash/capitalize'
import {Link} from 'react-router-dom'
import {LinkIcon} from '@heroicons/react/solid'

type RecurrentTask = {
  rule: string
  // eslint-disable-next-line camelcase
  next_date: string
  task: ApiTask
}

const ReccurentTasksPage: React.FC = () => {
  const query = useQuery<Array<RecurrentTask>>('recurrent-tasks', () =>
    api.get('recurrence/tasks').then(res => res.data)
  )

  return (
    <PageView>
      <h1 className="px-4 font-bold text-3xl">Recurrent Tasks</h1>
      {query.isSuccess && (
        <div className="p-4 space-y-4">
          {query.data.map(recurrence => {
            const {task} = recurrence
            return (
              <section
                className={clsx(
                  'border dark:border-dark-400 shadow-lg rounded-lg'
                )}
              >
                <div className="px-4 py-3">
                  <Link to={`/tasks/${task.id}`}>
                    <div className="flex items-center text-blue-500 dark:text-blue-400">
                      <h2 className="font-semibold text-l truncate">
                        {task.title}
                      </h2>
                      <LinkIcon className="ml-3 w-4 h-4 flex-shrink-0" />
                    </div>
                  </Link>
                  <div className="mt-1 text-sm">
                    <span>Next recurrence is on</span>
                    <span className="ml-1 bg-blue-100 dark:bg-dark-500 font-semibold text-blue-500 dark:text-gray-300 py-0.5 px-2 rounded-md">
                      {format(parseISO(recurrence.next_date), 'PP')}
                    </span>
                  </div>
                  <p className="mt-2">
                    {capitalize(RRule.fromString(recurrence.rule).toText())}
                  </p>
                </div>
                <button
                  className={clsx(
                    'px-4 py-2 w-full border-t dark:border-dark-400',
                    'active:bg-red-500 active:text-white',
                    'focus:outline-none rounded-b-lg',
                    'transition ease-in duration-75'
                  )}
                >
                  Remove recurrence
                </button>
              </section>
            )
          })}
        </div>
      )}
    </PageView>
  )
}

export default ReccurentTasksPage
