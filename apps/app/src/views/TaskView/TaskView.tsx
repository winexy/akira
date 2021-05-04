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

  return (
    <View>
      <h1 className="font-semibold text-2xl">{task?.title}</h1>
    </View>
  )
}
