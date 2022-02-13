import React from 'react'
import isToday from 'date-fns/isToday'
import {SunIcon as SunIconOutline} from '@heroicons/react/outline'
import {SunIcon} from '@heroicons/react/solid'
import {Spin} from 'shared/ui/spin'
import {Button} from 'shared/ui/button'
import {ApiTask, TaskId} from 'modules/tasks/types.d'
import {useTaskQuery} from 'modules/tasks/hooks'
import {useAddToMyDayMutation, useRemoveFromMyDayMutation} from '../model/index'

const isTaskOnMyDay = (task: ApiTask): boolean =>
  task.date ? isToday(new Date(task.date)) : false

export const MyDayToggle: React.FC<{taskId: TaskId}> = ({taskId}) => {
  const {data: isOnMyDay, isLoading, isFetching} = useTaskQuery(taskId, {
    select: isTaskOnMyDay,
  })

  const addToMyDayMutation = useAddToMyDayMutation()
  const removeFromMyDayMutation = useRemoveFromMyDayMutation()

  function toggle() {
    const mutation = isOnMyDay ? removeFromMyDayMutation : addToMyDayMutation
    mutation.mutate(taskId)
  }

  const isUpdating =
    addToMyDayMutation.isLoading || removeFromMyDayMutation.isLoading
  const isSyncing = isLoading || isFetching

  if (isUpdating || isSyncing) {
    return (
      <Button variant="outline" className="text-sm" disabled>
        <Spin className="w-5 h-5 mr-2" /> Loading...
      </Button>
    )
  }

  return (
    <Button variant="outline" className="text-sm" onClick={toggle}>
      {isOnMyDay ? (
        <>
          <SunIcon className="w-5 h-5 mr-2 text-amber-500" />
          <span className="text-blue-500">Added to my day</span>
        </>
      ) : (
        <>
          <SunIconOutline className="w-5 h-5 mr-2" />
          Add to my day
        </>
      )}
    </Button>
  )
}
