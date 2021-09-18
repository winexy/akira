import React from 'react'
import {Swipeable} from '@components/Swipeable/Swipeable'
import {TrashIcon} from '@heroicons/react/solid'
import {Link} from 'react-router-dom'
import isUndefined from 'lodash/fp/isUndefined'
import {useIsMutating, useMutation, useQueryClient} from 'react-query'
import clsx from 'clsx'
import {akira} from '@lib/akira'
import {closeMenu} from '@store/menu'
import {ActionSheet} from '@components/ActionSheet/ActionSheet'
import {openActionSheet, closeActionSheet} from '@store/action-sheet'
import {Spin} from '@components/Spin'
import {useListsQuery} from '../hooks/index'
import {TaskList} from '../types.d'

type Props = {
  className?: string
  allowRemoval?: boolean
}

function pluralize(count: number, one: string, other: string) {
  const rule = new Intl.PluralRules('en-US').select(count)
  return rule === 'one' ? one : other
}

type TaskListItemProps = {
  list: TaskList
  allowRemoval: boolean
}

const TaskListItem: React.FC<TaskListItemProps> = ({list, allowRemoval}) => {
  const queryClient = useQueryClient()
  const removeListMutation = useMutation(akira.lists.remove, {
    mutationKey: 'remove-tasks-list',
    onSuccess() {
      queryClient.invalidateQueries('lists')
    }
  })

  const isRemoving = Boolean(
    useIsMutating({
      mutationKey: 'remove-tasks-list',
      predicate(mutation) {
        return mutation.options.variables === list.id
      }
    })
  )

  function onRemoveIntent() {
    openActionSheet(`remove-task-list(${list.id})`)
  }

  function onRemoveConfirm() {
    removeListMutation.mutate(list.id)
    closeActionSheet()
  }

  return (
    <Swipeable
      Component="li"
      key={list.id}
      className={clsx(
        'rounded-md',
        'focus-within:ring-2 focus-within:ring-gray-600 dark:focus-within:ring-dark:600'
      )}
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
            disabled={isRemoving}
            onClick={onRemoveIntent}
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        ) : undefined
      }
    >
      <>
        <ActionSheet name={`remove-task-list(${list.id})`}>
          <ActionSheet.Action destructive onClick={onRemoveConfirm}>
            Delete task
          </ActionSheet.Action>
        </ActionSheet>
        <Link
          to={`/lists/${list.id}`}
          className={clsx(
            'flex items-center justify-between',
            'bg-gray-700 dark:bg-dark-700 px-4 py-2',
            'rounded-md',
            'transition ease-in duration-150',
            'active:text-gray-400',
            'focus:bg-gray-500'
          )}
          onClick={() => closeMenu()}
        >
          <span className="truncate">{list.title}</span>
          {isRemoving && <Spin className="w-5 h-5 text-opacity-30" />}
          {!isRemoving && list.tasksCount !== '0' && (
            <span className="ml-4 text-gray-400">
              {list.tasksCount}{' '}
              {pluralize(parseInt(list.tasksCount, 10), 'task', 'tasks')}
            </span>
          )}
        </Link>
      </>
    </Swipeable>
  )
}

export const TaskLists: React.FC<Props> = ({
  allowRemoval = true,
  className
}) => {
  const {data: lists} = useListsQuery()

  if (isUndefined(lists)) {
    return null
  }

  return (
    <ul className={clsx('space-y-1 text-base font-semibold', className)}>
      {lists.map(list => (
        <TaskListItem key={list.id} list={list} allowRemoval={allowRemoval} />
      ))}
    </ul>
  )
}
