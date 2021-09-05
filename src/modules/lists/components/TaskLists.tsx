import React from 'react'
import {Swipeable} from '@components/Swipeable/Swipeable'
import {TrashIcon} from '@heroicons/react/solid'
import {Link} from 'react-router-dom'
import isUndefined from 'lodash/fp/isUndefined'
import {useMutation, useQueryClient} from 'react-query'
import clsx from 'clsx'
import {akira} from '@lib/akira'
import {closeMenu} from '@store/menu'
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
    <ul className={clsx('text-base font-semibold', className)}>
      {lists.map(list => (
        <Swipeable
          Component="li"
          key={list.id}
          after={
            allowRemoval ? (
              <button
                className="
                  h-full px-3 
                  flex items-center justify-between  
                  text-white bg-red-500
                  transition ease-in duration-100
                  active:bg-red-600
                  focus:outline-none
                  rounded-r-md
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
              'flex items-center justify-between',
              'bg-gray-700 px-4 py-2',
              'rounded-md'
            )}
            onClick={() => closeMenu()}
          >
            <span className="truncate">{list.title}</span>
            {list.tasksCount !== '0' && (
              <span className="ml-4 text-gray-400">
                {list.tasksCount}{' '}
                {pluralize(parseInt(list.tasksCount, 10), 'task', 'tasks')}
              </span>
            )}
          </Link>
        </Swipeable>
      ))}
    </ul>
  )
}
