import React from 'react'
import {useListsQuery} from '@modules/lists/hooks'
import {usePatchTaskMutation} from '@modules/tasks/hooks'
import {TaskT} from '@store/tasks/types'
import {Spin} from '@components/Spin'
import clsx from 'clsx'
import {CheckIcon, ChevronRightIcon} from '@heroicons/react/solid'
import {Link} from 'react-router-dom'
import {Button} from '@components/Button'

type Props = {
  taskId: TaskT['id']
  activeListId: TaskT['list_id']
}

export const TaskListPicker: React.FC<Props> = ({taskId, activeListId}) => {
  const {data: lists = [], isLoading} = useListsQuery()
  const patchTaskMutation = usePatchTaskMutation(taskId)

  return (
    <>
      <div className="sticky top-0 p-4 bg-white border-b border-gray-100">
        <h2 className="text-xl font-semibold">Add to list</h2>
      </div>
      {isLoading || patchTaskMutation.isLoading ? (
        <div className="flex items-center justify-center flex-col py-12">
          <Spin className="text-gray-100 w-8 h-8" />
          <p className="mt-4 text-xl font-semibold text-gray-400">Loading...</p>
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-gray-100">
          {lists.map(list => (
            <li key={list.id}>
              <button
                className={clsx(
                  'w-full flex items-center px-4 py-3',
                  'font-semibold text-left ',
                  'transition ease-in duration-150 ',
                  'active:bg-gray-100 focus:outline-none',
                  'disabled:bg-white',
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
                {list.id === activeListId && (
                  <CheckIcon className="ml-auto w-5 h-5" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="sticky bottom-0 bg-white px-4 pt-4 pb-6 border-t border-gray-100">
        <Link to="/lists/new">
          <Button size="md" className="w-full">
            Create new list <ChevronRightIcon className="ml-auto w-6 h-6" />
          </Button>
        </Link>
      </div>
    </>
  )
}
