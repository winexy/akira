import React from 'react'
import {TaskId} from 'modules/tasks/types.d'
import {useMutation, useQueryClient} from 'react-query'
import {akira} from 'shared/api/akira'
import {Spin} from 'shared/ui/spin'
import {Button} from 'shared/ui/button'
import {SunIcon} from '@heroicons/react/solid'
import {SunIcon as SunIconOutline} from '@heroicons/react/outline'
import {TaskQuery} from 'modules/tasks/config'
import isToday from 'date-fns/isToday'
import {useTaskQuery} from '../hooks/index'

export const MyDayToggle: React.FC<{taskId: TaskId}> = ({taskId}) => {
  const {data: isOnMyDay, isLoading, isFetching} = useTaskQuery(taskId, {
    select: task => {
      return task.schedule ? isToday(new Date(task.schedule.date)) : false
    }
  })

  const queryClient = useQueryClient()

  const addToMyDayMutation = useMutation(akira.myday.add, {
    onSuccess(_, taskId) {
      queryClient.invalidateQueries(TaskQuery.MyDay())
      queryClient.invalidateQueries(TaskQuery.One(taskId))
      queryClient.invalidateQueries(TaskQuery.Week())
    }
  })
  const removeFromMyDayMutation = useMutation(akira.myday.remove, {
    onSuccess(_, taskId) {
      queryClient.invalidateQueries(TaskQuery.MyDay())
      queryClient.invalidateQueries(TaskQuery.One(taskId))
      queryClient.invalidateQueries(TaskQuery.Week())
    }
  })

  function onMyDayToggle() {
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
    <Button variant="outline" className="text-sm" onClick={onMyDayToggle}>
      {isOnMyDay ? (
        <>
          <SunIcon className="w-5 h-5 mr-2 text-yellow-500" />
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
