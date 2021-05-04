import React, {useEffect} from 'react'
import clsx from 'clsx'
import {useParams} from 'react-router'
import {View} from '@views/View/View'
import {useSelector, useDispatch} from '@store/index'
import {selectTask, loadTask} from '@store/tasks'
import isUndefined from 'lodash/fp/isUndefined'

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
      <div className="mt-6 px-6 space-x-2">
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
      <h1 className="mt-4 px-6 font-semibold text-2xl">{task.title}</h1>
    </View>
  )
}
