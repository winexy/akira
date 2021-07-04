import React from 'react'
import {Swipeable} from '@components/Swipeable/Swipeable'
import {TrashIcon} from '@heroicons/react/solid'
import {Link} from 'react-router-dom'
import clsx from 'clsx'
import {useMutation, useQueryClient} from 'react-query'
import {akira} from '@lib/akira'
import {TaskList} from '../types.d'

type Props = {
  lists: TaskList[]
  allowRemoval?: boolean
}

export const TaskLists: React.FC<Props> = ({lists, allowRemoval = true}) => {
  const queryClient = useQueryClient()
  const removeListMutation = useMutation(akira.lists.remove, {
    onSuccess() {
      queryClient.invalidateQueries(['lists'])
    }
  })

  return (
    <ul className="divide-y divide-gray-100">
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
              'flex px-4 py-3 bg-white',
              'font-semibold',
              'transition ease-in duration-150',
              'active:text-blue-500 active:bg-gray-50'
            )}
          >
            {list.title}
          </Link>
        </Swipeable>
      ))}
    </ul>
  )
}
