import React, {useEffect} from 'react'
import clsx from 'clsx'
import {useParams} from 'react-router'
import {View} from '@views/View/View'
import {useSelector, useDispatch} from '@store/index'
import {selectTask, loadTask} from '@store/tasks'
import isUndefined from 'lodash/fp/isUndefined'
import {ClipboardCheckIcon} from '@heroicons/react/solid'

export const TaskView: React.FC = () => {
  const {id} = useParams<{id: string}>()
  const task = useSelector(selectTask(id))
  const dispatch = useDispatch()

  useEffect(() => {
    if (isUndefined(task)) {
      dispatch(loadTask(id))
    }
  }, [id, task, dispatch])

  if (isUndefined(task)) {
    return <View>loading...</View>
  }

  return (
    <View>
      <div className="mt-4 px-4 space-x-2">
        <span
          className={clsx(
            'inline-block px-2 py-1',
            'font-bold text-xs text-white',
            'rounded shadow-md border',
            task.completed
              ? 'bg-green-500 border-green-600'
              : 'bg-gray-500 border-gray-600'
          )}
        >
          {task.completed ? '' : 'not '}completed
        </span>
        {task.important && (
          <span
            className={clsx(
              'inline-block px-2 py-1',
              'font-bold text-xs text-white',
              'rounded shadow-md border',
              'bg-red-500 border-red-600'
            )}
          >
            important
          </span>
        )}
      </div>
      <h1 className="mt-4 px-4 font-semibold text-2xl">{task.title}</h1>
      <section className="mt-4 px-4">
        <button
          className={clsx(
            'flex items-center justify-center',
            'px-3 py-2 rounded-md shadow-sm',
            'bg-gray-50 border border-gray-200',
            'select-none',
            'transition ease-in duration-150',
            'active:shadow-inner',
            'focus:outline-none'
          )}
        >
          <ClipboardCheckIcon className="mr-2 w-4 h-4" />
          Add Checklist
        </button>
      </section>
    </View>
  )
}
