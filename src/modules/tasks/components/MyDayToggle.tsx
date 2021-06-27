import React from 'react'
import {
  $myDayTasksIds,
  onMyDayTaskAdded,
  onMyDayTaskRemoved
} from '@/modules/tasks/store'
import {useStoreMap} from 'effector-react'
import {Spin} from '@/components/Spin'
import {TaskIdT} from '@store/tasks/types'
import {useIsFetching, useMutation} from 'react-query'
import {akira} from '@lib/akira'
import {Button} from '@components/Button'
import {SunIcon} from '@heroicons/react/solid'
import {SunIcon as SunIconOutline} from '@heroicons/react/outline'

export const MyDayToggle: React.FC<{taskId: TaskIdT}> = ({taskId}) => {
  const isOnMyDay = useStoreMap($myDayTasksIds, set => set.has(taskId))
  const isMyDayFetching = Boolean(useIsFetching(['myday']))

  const addToMyDayMutation = useMutation(akira.myday.add, {
    onSuccess(_, taskId) {
      onMyDayTaskAdded(taskId)
    }
  })
  const removeFromMyDayMutation = useMutation(akira.myday.remove, {
    onSuccess(_, taskId) {
      onMyDayTaskRemoved(taskId)
    }
  })

  function onMyDayToggle() {
    const mutation = isOnMyDay ? removeFromMyDayMutation : addToMyDayMutation
    mutation.mutate(taskId)
  }

  if (isMyDayFetching) {
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
