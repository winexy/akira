import clsx from 'clsx'
import React from 'react'
import {useMutation, useQueryClient} from 'react-query'
import {api} from 'shared/api'
import {List} from 'shared/ui/list'
import {TaskQuery} from 'modules/tasks/config'
import {makeRecurrencePayload} from '../lib/make-recurrence-payload'
import {matchRecurrenceType} from '../lib/match-recurrence-type'
import {RecurrenceEnum, recurrenceTypes} from '../model'

type Props = {
  taskId: string
}

export const Recurrence: React.FC<Props> = ({taskId}) => {
  const queryClient = useQueryClient()
  const makeRecurringTaskMutation = useMutation(
    (type: RecurrenceEnum) => {
      return api.post(`recurrence/${taskId}`, makeRecurrencePayload(type))
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(TaskQuery.One(taskId))
      }
    }
  )

  const onSelect = (type: RecurrenceEnum) => {
    makeRecurringTaskMutation.mutate(type)
  }

  return (
    <List>
      {recurrenceTypes.map(type => (
        <List.Item
          key={type}
          className={clsx('px-4 py-3 font-semibold')}
          onClick={() => onSelect(type)}
        >
          {matchRecurrenceType(type)}
        </List.Item>
      ))}
    </List>
  )
}
