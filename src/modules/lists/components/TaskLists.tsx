import React from 'react'
import {Swipeable} from '@components/Swipeable/Swipeable'
import {TrashIcon} from '@heroicons/react/solid'
import {Link} from 'react-router-dom'
import isUndefined from 'lodash/fp/isUndefined'
import clsx from 'clsx'
import {useMutation, useQueryClient} from 'react-query'
import {akira} from '@lib/akira'
import {useListsQuery} from '../hooks/index'

type Props = {
  className?: string
  allowRemoval?: boolean
}

function pluralize(count: number, one: string, other: string) {
  const rule = new Intl.PluralRules('en-US').select(count)
  return rule === 'one' ? one : other
}

export const TaskLists: React.FC<Props> = ({
  allowRemoval = true,
  className
}) => {
  const queryClient = useQueryClient()
  const {data: lists} = useListsQuery()
  const removeListMutation = useMutation(akira.lists.remove, {
    onSuccess() {
      queryClient.invalidateQueries('lists')
    }
  })

  if (isUndefined(lists)) {
    return null
  }

  return (
    <ul className={clsx('divide-y divide-gray-100', className)}>
      {lists.map(list => (
        <Swipeable
          Component="li"
          key={list.id}
          after={
            allowRemoval ? (
              <button
                className="
                  h-full px-4 
                  flex items-center justify-between  
                  text-white bg-red-500
                  transition ease-in duration-100
                  active:bg-red-600
                  focus:outline-none
                "
                onClick={() => {
                  removeListMutation.mutate(list.id)
                }}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            ) : undefined
          }
        >
          <Link
            to={`/lists/${list.id}`}
            className={clsx(
              'flex items-center px-4 py-3 bg-white',
              'font-semibold',
              'transition ease-in duration-150',
              'active:text-blue-500 active:bg-gray-50'
            )}
          >
            <div className="flex flex-col">
              {list.title}
              {list.tasksCount !== '0' && (
                <span className="text-xs text-gray-400">
                  {list.tasksCount}{' '}
                  {pluralize(list.tasksCount, 'task', 'tasks')}
                </span>
              )}
            </div>
          </Link>
        </Swipeable>
      ))}
    </ul>
  )
}
