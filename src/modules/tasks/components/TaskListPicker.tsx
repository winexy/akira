import React from 'react'
import {useListsQuery} from '@modules/lists/hooks'
import {usePatchTaskMutation} from '@modules/tasks/hooks'
import {ApiTask} from '@modules/tasks/types.d'
import {Spin} from '@components/Spin'
import clsx from 'clsx'
import {CheckIcon, ChevronRightIcon, InboxIcon} from '@heroicons/react/solid'
import {Link} from 'react-router-dom'
import {Button} from '@shared/ui/button'
import isEmpty from 'lodash/fp/isEmpty'
import get from 'lodash/fp/get'

type Props = {
  taskId: ApiTask['id']
  activeListId: ApiTask['list_id']
}

type MatchComponent = React.FC & {
  Case: React.FC<CaseWhen>
  Default: React.FC<CaseDefault>
}

const Match: MatchComponent = ({children}) => {
  const child = React.Children.toArray(children).find(child => {
    return Boolean(get('props.when', child) || get('props.default', child))
  })

  return <>{child}</>
}

type CaseWhen = {
  when: boolean
}

type CaseDefault = {
  default?: true
}

Match.Case = ({children}) => {
  return <>{children}</>
}

Match.Default = ({children}) => {
  return <>{children}</>
}

Match.Default.defaultProps = {
  default: true
}

export const TaskListPicker: React.FC<Props> = ({taskId, activeListId}) => {
  const {data: lists = [], isLoading} = useListsQuery()
  const patchTaskMutation = usePatchTaskMutation(taskId)

  return (
    <>
      <div className="sticky top-0 p-4 border-b border-gray-100 dark:border-dark-500">
        <h2 className="text-xl font-semibold">Add to list</h2>
      </div>
      <Match>
        <Match.Case when={isLoading}>
          <div className="flex items-center justify-center flex-col py-12">
            <Spin className="text-gray-100 w-8 h-8" />
            <p className="mt-4 text-xl font-semibold text-gray-400">
              Loading...
            </p>
          </div>
        </Match.Case>
        <Match.Case when={isEmpty(lists)}>
          <div className="p-4 flex justify-center items-center flex-col">
            <InboxIcon className="w-8 h-8" />
            <p className="mt-2 font-semibold text-xl">You have no lists yet</p>
          </div>
        </Match.Case>
        <Match.Default>
          <ul className="divide-y divide-gray-100 dark:divide-dark-500">
            {lists.map(list => (
              <li key={list.id}>
                <button
                  className={clsx(
                    'w-full flex items-center px-4 py-3',
                    'font-semibold text-left ',
                    'transition ease-in duration-150 ',
                    'active:bg-gray-100 focus:outline-none',
                    {
                      'text-blue-500': list.id === activeListId
                    }
                  )}
                  onClick={() => {
                    patchTaskMutation.mutate({
                      list_id: list.id
                    })
                  }}
                  disabled={list.id === activeListId}
                >
                  {list.title}
                  <Match>
                    <Match.Case
                      when={
                        patchTaskMutation.isLoading &&
                        patchTaskMutation.variables?.list_id === list.id
                      }
                    >
                      <Spin className="ml-auto text-gray-200 w-5 h-5" />
                    </Match.Case>
                    <Match.Case when={list.id === activeListId}>
                      <CheckIcon className="ml-auto w-5 h-5" />
                    </Match.Case>
                  </Match>
                </button>
              </li>
            ))}
          </ul>
        </Match.Default>
      </Match>
      <div className="sticky bottom-0 px-4 pt-4 pb-6 border-t border-gray-100 dark:border-dark-500">
        <Link to="/lists/new">
          <Button size="md" className="w-full">
            Create new list <ChevronRightIcon className="ml-auto w-6 h-6" />
          </Button>
        </Link>
      </div>
    </>
  )
}
